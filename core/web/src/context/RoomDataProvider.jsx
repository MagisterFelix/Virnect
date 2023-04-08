import React, {
  createContext,
  useContext,
  useMemo,
} from 'react';
import {
  Navigate,
  useNavigate, useParams, useSearchParams,
} from 'react-router-dom';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';
import handleErrors from '@api/errors';
import Room from '@components/room/Room';
import { CircularProgress } from '@mui/material';

const RoomContext = createContext(null);

const useRoom = () => useContext(RoomContext);

const RoomListProvider = ({ children }) => {
  const { username } = useParams();
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const [{ loading: loadingTopics, data: topics }] = useAxios(
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

  const [{ loading: loadingRoomList, data: roomList }, refetchRoomList] = useAxios(
    {
      url: searchParams.toString().length === 0
        ? `${ENDPOINTS.rooms}${username !== undefined ? `?host=${username}` : ''}`
        : `${ENDPOINTS.rooms}?${decodeURIComponent(searchParams.toString())}`,
      method: 'GET',
    },
  );

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

  const connect = async (roomInstance, form, validation, setError, setAlert) => {
    setAlert(null);
    try {
      await execute({
        url: `${ENDPOINTS.connecting}${roomInstance.title}/`,
        method: 'PATCH',
        data: form,
      });
      navigate(`/room/${roomInstance.title}`);
    } catch (err) {
      handleErrors(validation, err.response.data.details, setError, setAlert);
    }
  };

  const getTags = async (roomInstance) => {
    const response = await execute({
      url: ENDPOINTS.tags,
      method: 'GET',
    });
    return response.data.filter((tag) => tag.room === roomInstance.id);
  };

  const addTags = async (tags) => {
    const promises = tags.map((tag) => execute({
      url: ENDPOINTS.tags,
      data: tag,
    }));
    await Promise.all(promises);
  };

  const removeTags = async (tags) => {
    const promises = tags.map((tag) => execute({
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
      await connect(response.data.room, {}, {}, setError, setAlert);
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
      const tags = await getTags(roomInstance);
      response.data.room.tags = tags;
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
    loadingTopics,
    topics,
    loadingRoomOptions,
    roomOptions,
    loadingRoomList,
    roomList,
    loading,
    connect,
    createRoom,
    updateRoom,
    deleteRoom,
    notFound,
  }), [loadingTopics, topics, loadingRoomOptions, roomOptions, loadingRoomList, roomList, loading]);

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};

const RoomProvider = ({ children }) => {
  const { title } = useParams();

  const [{ loading: loadingRoom, data: room }] = useAxios(
    {
      url: `${ENDPOINTS.room}${title}/`,
      method: 'GET',
    },
  );

  const value = useMemo(() => ({
    loadingRoom, room,
  }), [loadingRoom, room]);

  return (
    <RoomContext.Provider value={value}>
      {loadingRoom
        ? (
          <div style={{
            minHeight: '100dvh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          >
            <CircularProgress />
          </div>
        )
        : children}
    </RoomContext.Provider>
  );
};

const ProtectedRoomRoute = () => {
  const { room } = useRoom();
  return room ? <Room /> : <Navigate to="/" replace />;
};

export {
  useRoom, RoomListProvider, RoomProvider, ProtectedRoomRoute,
};
