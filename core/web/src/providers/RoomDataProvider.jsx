import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  useBeforeUnload,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import { w3cwebsocket as W3CWebSocket } from 'websocket';

import SimplePeer from 'simple-peer';

import {
  LinearProgress,
} from '@mui/material';

import { toast } from 'react-toastify';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';
import handleErrors from '@api/errors';

import { useAuth } from '@providers/AuthProvider';

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
      useCache: searchParams.toString().length !== 0,
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

  const [preventFilterLoading, setPreventFilterLoading] = useState(false);

  useEffect(() => {
    socket.onmessage = async (message) => {
      const data = JSON.parse(message.data);
      if (data.type === 'room_list_update') {
        setPreventFilterLoading(true);
        await refetchRoomList();
        setPreventFilterLoading(false);
      }
    };
    return () => {
      socket.close();
    };
  }, [socket]);

  const [filterLoading, setFilterLoading] = useState(false);

  useEffect(() => {
    if (!preventFilterLoading) {
      setFilterLoading(loadingRoomList);
    }
  }, [loadingRoomList, preventFilterLoading]);

  const value = useMemo(() => ({
    socket,
    loadingTopicList,
    topicList,
    loadingRoomOptions,
    roomOptions,
    loadingRoomList,
    roomList,
    refetchRoomList,
    loadingTagList,
    tagList,
    pageCount,
    notFound,
    loading,
    createRoom,
    updateRoom,
    deleteRoom,
    filterLoading,
  }), [
    loadingTopicList,
    topicList,
    loadingRoomOptions,
    roomOptions,
    loadingRoomList,
    roomList,
    pageCount,
    loading,
    filterLoading,
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

  const { profile, refetchProfile } = useAuth();

  let socket = useMemo(() => new W3CWebSocket(`${ENDPOINTS.wsRoom}${title}/${location.state?.key ? `?key=${location.state.key}` : ''}`), []);

  useEffect(() => {
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

  const [{ data: room }, fetchRoom] = useAxios(
    {
      url: `${ENDPOINTS.room}${title}/`,
      method: 'GET',
    },
    {
      manual: true,
      autoCancel: false,
    },
  );

  const [{ loading: loadingMessageList, data: messageList }, fetchMessageList] = useAxios(
    {
      url: `${ENDPOINTS.messages}${title}/`,
      method: 'GET',
    },
    {
      manual: true,
      autoCancel: false,
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

  const kickUser = (user) => {
    socket.send(JSON.stringify({
      type: 'user_kick',
      user,
    }));
  };

  const [messages, setMessages] = useState(null);

  const sendMessage = async (form) => {
    await execute({
      url: `${ENDPOINTS.messages}${title}/`,
      data: form,
    });
  };

  const editMessage = async (messageInstance, form) => {
    await execute({
      url: `${ENDPOINTS.message}${title}/${messageInstance.id}/`,
      method: 'PATCH',
      data: form,
    });
  };

  const deleteMessage = async (messageInstance) => {
    await execute({
      url: `${ENDPOINTS.message}${title}/${messageInstance.id}/`,
      method: 'DELETE',
    });
  };

  useEffect(() => {
    if (!loadingMessageList) {
      setMessages(messageList);
    }
  }, [loadingMessageList, messageList]);

  const [voiceChatUsers, setVoiceChatUsers] = useState([]);
  const [peers, setPeers] = useState({});
  const [stream, setStream] = useState(null);
  const [isMuted, setIsMuted] = useState(true);

  const detectSpeaking = (userStream) => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(userStream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    let isSpeaking = false;
    const THRESHOLD = 10;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const intervalID = setInterval(() => {
      if (!userStream.active) {
        clearInterval(intervalID);
        return;
      }
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((acc, val) => {
        if (val > THRESHOLD) {
          return acc + val;
        }
        return acc;
      }, 0) / bufferLength;
      if ((avg <= THRESHOLD || !userStream.getAudioTracks()[0].enabled) && isSpeaking) {
        isSpeaking = false;
        socket.send(JSON.stringify({
          type: 'voice_chat_toggle_speaking',
          user: profile.id,
          is_speaking: isSpeaking,
        }));
      } else if (avg > THRESHOLD && userStream.getAudioTracks()[0].enabled && !isSpeaking) {
        isSpeaking = true;
        socket.send(JSON.stringify({
          type: 'voice_chat_toggle_speaking',
          user: profile.id,
          is_speaking: isSpeaking,
        }));
      }
    }, 100);
  };

  const createPeer = (userID, userStream) => {
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: userStream,
    });
    peer.on('signal', (signal) => {
      socket.send(JSON.stringify({
        type: 'voice_chat_signal',
        from: profile.id,
        to: userID,
        offer: signal,
      }));
    });
    peer.on('stream', (remoteStream) => {
      const audio = new Audio();
      audio.srcObject = remoteStream;
      audio.play();
    });
    return peer;
  };

  const addPeer = (userID, offer, userStream) => {
    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: userStream,
    });
    peer.signal(offer);
    peer.on('signal', (signal) => {
      socket.send(JSON.stringify({
        type: 'voice_chat_signal',
        from: profile.id,
        to: userID,
        answer: signal,
      }));
    });
    peer.on('stream', (remoteStream) => {
      const audio = new Audio();
      audio.srcObject = remoteStream;
      audio.play();
    });
    return peer;
  };

  const connectToVoiceChat = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((userStream) => {
        const audio = userStream.getAudioTracks()[0];
        if (audio) {
          audio.enabled = !audio.enabled;
        }
        setStream(userStream);
        const data = {
          id: profile.id,
          username: profile.username,
          image: profile.image,
          is_muted: true,
          is_speaking: false,
        };
        socket.send(JSON.stringify({
          type: 'voice_chat_connect',
          user: data,
        }));
        const newPeers = {};
        voiceChatUsers.forEach((user) => {
          newPeers[user.id] = createPeer(user.id, userStream);
        });
        setPeers(newPeers);
        detectSpeaking(userStream);
      })
      .catch(() => {
        toast('Access to media devices was not granted.', { type: 'error' });
      });
  };

  const toggleMic = () => {
    const audio = stream.getAudioTracks()[0];
    if (!audio) {
      return;
    }
    audio.enabled = !audio.enabled;
    setIsMuted(!audio.enabled);
    socket.send(JSON.stringify({
      type: 'voice_chat_toggle_mic',
      user: profile.id,
      is_muted: !audio.enabled,
    }));
  };

  const disconnectFromVoiceChat = () => {
    const audio = stream.getAudioTracks()[0];
    if (audio) {
      audio.stop();
    }
    setIsMuted(true);
    socket.send(JSON.stringify({
      type: 'voice_chat_disconnect',
      user: profile.id,
    }));
    Object.values(peers).forEach((peer) => peer.destroy());
    setPeers({});
  };

  useBeforeUnload(() => {
    if (voiceChatUsers.find((user) => user.id === profile.id)) {
      disconnectFromVoiceChat();
    }
  });

  useEffect(() => {
    socket.onmessage = async (message) => {
      const data = JSON.parse(message.data);
      if (data.type === 'room_connect') {
        await fetchRoom();
        await fetchMessageList();
        if (voiceChatUsers.map((user) => user.id).includes(profile.id)) {
          setVoiceChatUsers(data.voice_chat_users);
        } else {
          setVoiceChatUsers(data.voice_chat_users.map(
            (user) => ({
              ...user,
              is_speaking: false,
            }),
          ));
        }
      } else if (data.type === 'room_disconnect') {
        const responseRoom = await fetchRoom();
        if (responseRoom.data.participants.findIndex((user) => user.id === profile.id) === -1) {
          if (voiceChatUsers.find((user) => user.id === profile.id)) {
            disconnectFromVoiceChat();
          }
          socket = new W3CWebSocket(`${ENDPOINTS.wsRoom}${title}/${location.state?.key ? `?key=${location.state.key}` : ''}`);
        }
        setVoiceChatUsers(data.voice_chat_users);
      } else if (data.type === 'room_update') {
        if (data.room !== title) {
          if (location.state && location.state.key !== undefined) {
            navigate(`/room/${data.room}`, { state: { key: location.state.key }, replace: true });
          } else {
            navigate(`/room/${data.room}`, { replace: true });
          }
          window.location.reload();
        } else if (data.user !== undefined) {
          await fetchRoom();
          await fetchMessageList();
          if (data.user === profile.id) {
            await refetchProfile();
          }
          setVoiceChatUsers(data.voice_chat_users);
        } else {
          await fetchRoom();
          await fetchMessageList();
        }
      } else if (data.type === 'room_delete') {
        if (voiceChatUsers.find((user) => user.id === profile.id)) {
          disconnectFromVoiceChat();
        }
        navigate('/', {
          state: {
            toast: {
              type: 'info',
              message: `The «${title}» room has been deleted.`,
            },
          },
          replace: true,
        });
      } else if (data.type === 'user_kick') {
        if (profile.id === data.user) {
          if (voiceChatUsers.find((user) => user.id === profile.id)) {
            disconnectFromVoiceChat();
          }
          navigate('/', {
            state: {
              toast: {
                type: 'warning',
                message: 'You have been kicked.',
              },
            },
            replace: true,
          });
        }
      } else if (data.type === 'message_send') {
        setMessages([...messages, data.message]);
      } else if (data.type === 'message_edit') {
        setMessages(messages.map((msg) => (msg.id === data.id ? data.message : msg)));
        if (messages.some((msg) => msg.reply_to?.id === data.id)) {
          await fetchMessageList();
        }
      } else if (data.type === 'message_delete') {
        setMessages(messages.filter((msg) => msg.id !== data.id && msg.reply_to?.id !== data.id));
      } else if (data.type === 'voice_chat_connect') {
        setVoiceChatUsers(data.voice_chat_users);
      } else if (data.type === 'voice_chat_signal') {
        if (data.to === profile.id) {
          if (peers[data.from] !== undefined) {
            peers[data.from].signal(data.answer);
          } else {
            const newPeers = { ...peers };
            newPeers[data.from] = addPeer(data.from, data.offer, stream);
            setPeers(newPeers);
          }
        }
      } else if (data.type === 'voice_chat_toggle_mic') {
        setVoiceChatUsers(voiceChatUsers.map(
          (user) => (user.id === data.user
            ? {
              ...user,
              is_muted: data.is_muted,
            } : user
          ),
        ));
      } else if (data.type === 'voice_chat_toggle_speaking') {
        if (voiceChatUsers.map((user) => user.id).includes(profile.id)) {
          setVoiceChatUsers(voiceChatUsers.map(
            (user) => (user.id === data.user
              ? {
                ...user,
                is_speaking: data.is_speaking,
              } : user
            ),
          ));
        }
      } else if (data.type === 'voice_chat_disconnect') {
        if (data.user !== profile.id) {
          setVoiceChatUsers(data.voice_chat_users);
        } else {
          setVoiceChatUsers(data.voice_chat_users.map(
            (user) => ({
              ...user,
              is_speaking: false,
            }),
          ));
        }
        if (peers[data.user] !== undefined) {
          peers[data.user].destroy();
          const newPeers = Object.fromEntries(
            Object.entries(peers).filter((peer) => parseInt(peer[0], 10) !== data.user),
          );
          setPeers(newPeers);
        }
      }
    };
  }, [socket, messages, voiceChatUsers, peers, stream]);

  const value = useMemo(() => ({
    socket,
    loading,
    room,
    fetchRoom,
    kickUser,
    messages,
    sendMessage,
    editMessage,
    deleteMessage,
    voiceChatUsers,
    isMuted,
    connectToVoiceChat,
    toggleMic,
    disconnectFromVoiceChat,
  }), [loading, room, messages, voiceChatUsers, isMuted]);

  return (
    <RoomContext.Provider value={value}>
      {!room || !messages ? <LinearProgress sx={{ mt: -4 }} /> : children}
    </RoomContext.Provider>
  );
};

export {
  useRoomList, RoomListProvider, useRoom, RoomProvider,
};
