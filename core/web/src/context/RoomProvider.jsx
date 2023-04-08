import React, {
  createContext,
  useContext,
  useMemo,
} from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';
import handleErrors from '@api/errors';

const RoomContext = createContext(null);

const useRoom = () => useContext(RoomContext);

const RoomProvider = ({ children }) => {
  const { username, title } = useParams();
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

  let roomDataURL;
  if (username) {
    roomDataURL = `${ENDPOINTS.rooms}?host=${username}`;
  } else if (title) {
    roomDataURL = `${ENDPOINTS.room}${title}`;
  } else {
    roomDataURL = `${ENDPOINTS.rooms}?${decodeURIComponent(searchParams.toString())}`;
  }

  const [{ loading: loadingRoomData, data: roomData }, refetchRoomData] = useAxios(
    {
      url: roomDataURL,
      method: 'GET',
    },
  );

  const [{ loading }, execute] = useAxios(
    {
      method: 'POST',
    },
    {
      manual: true,
      autoCancel: false,
    },
  );

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
      navigate(`/room/${form.title}`);
    } catch (err) {
      handleErrors(validation, err.response.data.details, setError, setAlert);
    }
  };

  const updateRoom = async (room, form, validation, setError, setAlert, setRoom, reset) => {
    setAlert(null);
    try {
      const response = await execute({
        url: `${ENDPOINTS.room}${room.title}/`,
        method: 'PATCH',
        data: form,
      });
      if (form.tags !== undefined) {
        const innerJoin = form.tags.filter(
          (tag) => room.tags.map((roomTag) => roomTag.name).includes(tag),
        );
        const toRemove = room.tags.filter((tag) => !innerJoin.includes(tag.name));
        const toAdd = form.tags.filter((tag) => !innerJoin.includes(tag));
        await removeTags(toRemove);
        await addTags(toAdd.map((tag) => ({ room: room.id, name: tag })));
      }
      const updated = await execute({
        url: `${ENDPOINTS.room}${room.title}/`,
        method: 'GET',
      });
      setRoom(updated.data);
      reset({
        title: updated.data.title,
        topic: updated.data.topic.id,
        tags: updated.data.tags.map((tag) => tag.name),
        language: updated.data.language,
        number_of_participants: updated.data.number_of_participants,
        key: updated.data.key,
      });
      await refetchRoomData();
      setAlert({ type: 'success', message: response.data.details });
    } catch (err) {
      handleErrors(validation, err.response.data.details, setError, setAlert);
    }
  };

  const deleteRoom = async (room) => {
    await execute({
      url: `${ENDPOINTS.room}${room.title}/`,
      method: 'DELETE',
    });
    await refetchRoomData();
  };

  const error = (username !== undefined ? 'User hasn\'t created any room yet :(' : 'No rooms were found :(');

  const value = useMemo(() => ({
    loading,
    loadingRoomData,
    roomData,
    loadingTopics,
    topics,
    loadingRoomOptions,
    roomOptions,
    createRoom,
    updateRoom,
    deleteRoom,
    error,
  }), [loading, loadingRoomData, roomData, loadingTopics, topics, loadingRoomOptions, roomOptions]);

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};

export {
  useRoom, RoomProvider,
};
