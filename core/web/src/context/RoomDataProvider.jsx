import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  useLocation, useNavigate, useParams, useSearchParams,
} from 'react-router-dom';

import { w3cwebsocket as W3CWebSocket } from 'websocket';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';
import handleErrors from '@api/errors';

import { useConnection } from '@context/ConnectionProvider';

const RoomContext = createContext(null);

const useRoomData = () => useContext(RoomContext);

const RoomListProvider = ({ children }) => {
  const { username } = useParams();
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const [{ loading: loadingTopicList, data: topicList }] = useAxios(
    {
      url: ENDPOINTS.topics,
      method: 'GET',
    },
  );

  const [{ loading: loadingRoomOptions, data: roomOptions }] = useAxios(
    {
      url: ENDPOINTS.rooms,
      method: 'OPTIONS',
    },
  );

  const [{ loading: loadingTagList, data: tagList }, refetchTagList] = useAxios(
    {
      url: `${ENDPOINTS.tags}?unique=true`,
      method: 'GET',
    },
  );

  const [{ loading: loadingRoomList, data: roomList }, refetchRoomList] = useAxios(
    {
      url: searchParams.toString().length === 0
        ? `${ENDPOINTS.rooms}${username !== undefined ? `?host=${username}` : ''}`
        : `${ENDPOINTS.rooms}?${decodeURIComponent(searchParams.toString())}`,
      method: 'GET',
    },
    {
      autoCancel: false,
    },
  );

  const socket = useMemo(() => new W3CWebSocket(ENDPOINTS.wsRoomList), []);

  const [pageCount, setPageCount] = useState(0);
  useEffect(() => {
    if (roomList) {
      setPageCount(Math.ceil(roomList.count / 5));
    }
  }, [roomList]);

  const notFound = (username !== undefined ? 'User hasn\'t created any room yet :(' : 'No rooms were found :(');

  const [{ loading }, execute] = useAxios(
    {
      method: 'POST',
    },
    {
      manual: true,
      autoCancel: false,
    },
  );

  const getTagsByRoom = async (roomInstance) => {
    const response = await refetchTagList({
      url: ENDPOINTS.tags,
    });
    return response.data.filter((tag) => tag.room === roomInstance.id);
  };

  const addTags = async (toAdd) => {
    const promises = toAdd.map((tag) => execute({
      url: ENDPOINTS.tags,
      data: tag,
    }));
    await Promise.all(promises);
  };

  const removeTags = async (toRemove) => {
    const promises = toRemove.map((tag) => execute({
      url: `${ENDPOINTS.tag}${tag.id}/`,
      method: 'DELETE',
    }));
    await Promise.all(promises);
  };

  const createRoom = async (form, validation, setError, setAlert) => {
    setAlert(null);
    try {
      const response = await execute({
        url: ENDPOINTS.rooms,
        data: form,
      });
      await addTags(form.tags.map((tag) => ({
        room: response.data.room.id,
        name: tag,
      })));
      navigate(`/room/${response.data.room.title}`);
    } catch (err) {
      handleErrors(validation, err.response.data.details, setError, setAlert);
    }
  };

  const updateRoom = async (roomInstance, form, validation, setError, setAlert, setRoom, reset) => {
    setAlert(null);
    try {
      const response = await execute({
        url: `${ENDPOINTS.room}${roomInstance.title}/`,
        method: 'PATCH',
        data: form,
      });
      if (form.tags !== undefined) {
        const innerJoin = form.tags.filter(
          (tag) => roomInstance.tags.map((roomTag) => roomTag.name).includes(tag),
        );
        const toRemove = roomInstance.tags.filter((tag) => !innerJoin.includes(tag.name));
        const toAdd = form.tags.filter((tag) => !innerJoin.includes(tag));
        await removeTags(toRemove);
        await addTags(toAdd.map((tag) => ({ room: roomInstance.id, name: tag })));
      }
      socket.send(JSON.stringify({
        type: 'room_list_update',
      }));
      const tagsByRoom = await getTagsByRoom(roomInstance);
      response.data.room.tags = tagsByRoom;
      setRoom(response.data.room);
      reset({
        title: response.data.room.title,
        topic: response.data.room.topic.id,
        tags: response.data.room.tags.map((tag) => tag.name),
        language: response.data.room.language,
        number_of_participants: response.data.room.number_of_participants,
        key: response.data.room.key,
      });
      setAlert({ type: 'success', message: response.data.details });
    } catch (err) {
      handleErrors(validation, err.response.data.details, setError, setAlert);
    }
  };

  const deleteRoom = async (roomInstance) => {
    await execute({
      url: `${ENDPOINTS.room}${roomInstance.title}/`,
      method: 'DELETE',
    });
  };

  useEffect(() => {
    socket.onmessage = async (message) => {
      const data = JSON.parse(message.data);
      if (data.type === 'room_list_update') {
        await refetchRoomList();
      }
    };
  }, [socket, refetchRoomList]);

  const [searchLoading, setSearchLoading] = useState(false);

  const value = useMemo(() => ({
    loadingTopicList,
    topicList,
    loadingRoomOptions,
    roomOptions,
    loadingRoomList,
    roomList,
    loadingTagList,
    tagList,
    pageCount,
    notFound,
    loading,
    createRoom,
    updateRoom,
    deleteRoom,
    searchLoading,
    setSearchLoading,
  }), [
    loadingTopicList,
    topicList,
    loadingRoomOptions,
    roomOptions,
    loadingRoomList,
    roomList,
    pageCount,
    loading,
    searchLoading,
  ]);

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};

const RoomProvider = ({ children }) => {
  const { title } = useParams();

  const location = useLocation();
  const navigate = useNavigate();

  const { connect, disconnect } = useConnection();

  const [{ loading: loadingRoom, data: room }, fetchRoom] = useAxios(
    {
      url: `${ENDPOINTS.room}${title}/`,
      method: 'GET',
    },
    {
      manual: true,
      autoCancel: false,
    },
  );

  const socket = useMemo(() => new W3CWebSocket(`${ENDPOINTS.wsRoom}${title}/`), []);

  useEffect(() => {
    socket.onopen = async () => {
      await connect(title, location.state ? location.state.key : null);
    };

    socket.onmessage = async (message) => {
      const data = JSON.parse(message.data);
      if (data.type === 'room_update') {
        await fetchRoom();
      } else if (data.type === 'room_delete') {
        navigate('/', {
          state: {
            notification: {
              type: 'info',
              message: `The «${title}» room has been deleted.`,
            },
          },
          replace: true,
        });
      }
    };

    const handleBeforeUnload = async () => {
      await disconnect(title);
      socket.close();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [socket, fetchRoom, title, location.state]);

  const value = useMemo(() => ({
    loadingRoom, room,
  }), [loadingRoom, room]);

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};

export {
  useRoomData, RoomListProvider, RoomProvider,
};
