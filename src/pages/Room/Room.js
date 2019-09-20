import React, { useEffect, useState, useCallback } from 'react';

import { Layout } from '../../components';
import { Redirect } from 'react-router-dom';
import socket from '../../socket';
import _get from 'lodash/get';
import { GET, PUT, POST } from '../../api';
import { getMe } from '../../utils/auth';
import { List, Loader, Container, Button } from 'semantic-ui-react';
import classnames from 'classnames';

import styles from "./styles.module.scss";

const MIN_POSSIBLE_USERS = 5;

export default props => {
	if (!socket.isConnected()) return <Redirect to="/" />;

	const [room, setRoom] = useState({});
	const [loading, setLoading] = useState(true);

	const roomId = _get(props, 'match.params.roomId');

	const startGame = theRoomId => {
		POST(`/games`, { body: { roomId: theRoomId } })	
			.catch(console.error); // TODO: what's the catch?!
	};

	const gameStartHandler = useCallback(
		({ _id }) => props.history.push(`/games/${_id}`),
		[props.history]
	);
	useEffect(() => {
		const updateHandler = newRoom => {
			if (newRoom._id !== roomId) return;
			setRoom(newRoom);
		};

		setLoading(true);
		GET(`/rooms/${roomId}`)
			.then(r => {
				setRoom(r);
				setLoading(false);
				socket.addEventListener('room updated', updateHandler);
				socket.addEventListener('game started', gameStartHandler);
			})
			.catch(console.error); // TODO: what's the catch?!

		return () => {
			socket.removeEventListener('room updated', updateHandler);
			socket.removeEventListener('game started', gameStartHandler);
			PUT(`/users/leave-room`)
				.then(() => {})
				.catch(console.error); // TODO: what's the catch?!
		};
	}, [roomId, gameStartHandler]);

	const { name, users, host } = room;
	const { _id: hostId } = host || {};
	const isHost = getMe()._id === hostId;
	const canStartGame = isHost && users.length >= MIN_POSSIBLE_USERS;

	return (
		<Layout>
			{loading ? (
				<Loader active />
			) : (
				<Container>
					<h1>Room: {name}</h1>
					<List>
						{users.map(({ _id, displayName, isConnected }) => {
							const itemClassnNames = classnames({
								[styles.listItem]: true,
								[styles.disconnected]: !isConnected,
							});
							return <List.Item className={itemClassnNames} key={_id}>{displayName}</List.Item>;
						})}
					</List>
					{canStartGame && (
						<Button onClick={() => startGame(roomId)}>Start Game</Button>
					)}
				</Container>
			)}
		</Layout>
	);
};
