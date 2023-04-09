import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';
import handleErrors from '@api/errors';

import { useConnection } from '@context/ConnectionProvider';

import Room from '@components/room/Room';

const RoomContext = createContext(null);

const useRoomData = () => useContext(RoomContext);

const RoomListProvider = ({ children }) => {
  const { username } = useParams();
  const [searchParams] = useSearchParams();

  const { connect } = useConnection();

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
      await connect(response.data.room.title, {}, {}, setError, setAlert);
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
      await refetchRoomList();
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
    await refetchRoomList();
  };

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
  }), [
    loadingTopicList,
    topicList,
    loadingRoomOptions,
    roomOptions,
    loadingRoomList,
    roomList,
    pageCount,
    loading,
  ]);

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};

const RoomProvider = ({ children }) => {
  const { title } = useParams();

  const [{ loading: loadingRoom, data: room, error: errorData }] = useAxios(
    {
      url: `${ENDPOINTS.room}${title}/`,
      method: 'GET',
    },
  );

  const value = useMemo(() => ({
    loadingRoom, room, errorData,
  }), [loadingRoom, room, errorData]);

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};

const ProtectedRoomRoute = () => {
  const { title } = useParams();

  const navigate = useNavigate();

  const { connect } = useConnection();

  const { room, errorData } = useRoomData();

  const retry = async () => {
    await connect(title, {}, {}, null, null);
  };

  useEffect(() => {
    if (!room && errorData) {
      if (errorData.response.status !== 404) {
        retry();
      } else {
        navigate('/', {
          state: {
            notification: {
              type: 'error',
              message: `The «${title}» room was not found`,
            },
          },
          replace: true,
        });
      }
    }
  }, [room, errorData]);

  return <Room />;
};

export {
  useRoomData, RoomListProvider, RoomProvider, ProtectedRoomRoute,
};
