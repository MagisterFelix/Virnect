import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import { w3cwebsocket as W3CWebSocket } from 'websocket';

import {
  LinearProgress,
} from '@mui/material';

import { toast } from 'react-toastify';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';
import handleErrors from '@api/errors';

const RoomListContext = createContext(null);

const useRoomList = () => useContext(RoomListContext);

const RoomListProvider = ({ children }) => {
  const { username } = useParams();
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const socket = useMemo(() => new W3CWebSocket(ENDPOINTS.wsRoomList), []);

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
      toast(`The «${form.title}» room has been created.`, { type: 'success' });
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
    toast(`The «${roomInstance.title}» room has been removed.`, { type: 'success' });
  };

  useEffect(() => {
    socket.onmessage = async (message) => {
      const data = JSON.parse(message.data);
      if (data.type === 'room_list_update') {
        await refetchRoomList();
      }
    };

    return () => {
      socket.close();
    };
  }, [socket]);

  const [searchLoading, setSearchLoading] = useState(false);

  const value = useMemo(() => ({
    socket,
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
    <RoomListContext.Provider value={value}>
      {children}
    </RoomListContext.Provider>
  );
};

const RoomContext = createContext(null);

const useRoom = () => useContext(RoomContext);

const RoomProvider = ({ children }) => {
  const { title } = useParams();

  const location = useLocation();
  const navigate = useNavigate();

  const socket = useMemo(() => new W3CWebSocket(`${ENDPOINTS.wsRoom}${title}/${location.state?.key ? `?key=${location.state.key}` : ''}`), []);

  const [{ loading: loadingRoom, data: room }, fetchRoom] = useAxios(
    {
      url: `${ENDPOINTS.room}${title}/`,
      method: 'GET',
    },
    {
      manual: true,
    },
  );

  useEffect(() => {
    socket.onopen = async () => {
      await fetchRoom();
    };

    socket.onerror = () => {
      navigate('/', {
        state: {
          toast: {
            type: 'error',
            message: `Failed to join the «${title}» room.`,
          },
        },
        replace: true,
      });
    };

    return () => {
      socket.close();
    };
  }, [socket]);

  const value = useMemo(() => ({
    socket,
    loadingRoom,
    room,
    fetchRoom,
  }), [loadingRoom, room]);

  return (
    <RoomContext.Provider value={value}>
      {!room ? <LinearProgress sx={{ mt: -3 }} /> : children}
    </RoomContext.Provider>
  );
};

export {
  useRoomList, RoomListProvider, useRoom, RoomProvider,
};
