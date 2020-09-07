import React from 'react';
import Board from '../board/board.component';

import {
  MenuContainer,
  GameContainer,
  MessageContainer,
  BoardBodyContainer,
  BoardHeaderContainer,
  BoardWrapperContainer,
  ConnectionStatusContainer
} from './game.styles';

import CoolButton from '../cool-button/cool-button.component';

import WebSocketService from '../../services/WebSocketService';

class Game extends React.PureComponent {
  currentLevel = 1;
  gameStarted = false;

  state = {
    map: [],
    connectionStatus: 'offline',
    gameOver: false
  };

  componentDidMount = () => {
    this.connection = new WebSocketService();
    this.connection.connect();
    this.connection.on('open', this.onOpen);
    this.connection.on('close', this.onClose);
    this.connection.on('message', this.onMessage);
  };

  onOpen = () => {
    this.connectionTime = new Date();
    this.setState({ connectionStatus: 'online' });
  };

  onClose = () => {
    this.setState({ connectionStatus: 'offline' });
  };

  onMessage = message => {
    const data = message.data;
    const command = (data || '').split(':')[0];
    switch (command) {
      case 'map': {
        this.paintMap(data);
        break;
      }
      case 'open': {
        if (data.indexOf('You lose') >= 0) {
          console.log('%c Game Over!', 'color: red;');
          this.setState({ gameOver: true });
        }
        break;
      }
      case 'help':
      case 'new': {
        break;
      }
      default: {
        console.log(
          '%c warning: command not handled yet',
          'color: orange;',
          command,
          data
        );
        break;
      }
    }
  };

  paintMap = data => {
    if (data.indexOf('Not started') >= 0) {
      this.gameStarted = false;
      this.setState({ map: [] });
      return;
    }
    const map = data.trim().substr(5).split('\n');

    this.setState({ map: map });
  };

  restartGame = () => {
    this.setState({ gameOver: false });
    this.startGame();
  };

  setLevelAndStartGame = level => {
    this.currentLevel = level || '1';
    this.startGame();
  };

  startGame = () => {
    let level = this.currentLevel || '1';

    this.gameStarted = true;
    this.connection.send(`new ${level}`);
    this.connection.send('map');
  };

  onButtonClick = action => {
    this.connection.send(`open ${action}`);
    this.connection.send('map');
  };

  exitGame = () => {
    this.gameStarted = false;
    this.setState({ map: [] });
  };

  render() {
    const { map, gameOver, connectionStatus } = this.state;
    return (
      <div>
        <ConnectionStatusContainer
          title={`You are connected since: ${this.connectionTime}`}
        >
          <div className={`status ${connectionStatus}`} />
          <span>{connectionStatus}</span>
        </ConnectionStatusContainer>
        <GameContainer>
          {this.gameStarted ? (
            <BoardWrapperContainer>
              <BoardHeaderContainer>
                <button onClick={this.exitGame}>Main Menu</button>
                <button onClick={this.restartGame} hidden={!gameOver}>
                  Restart game
                </button>
                <MessageContainer hidden={!gameOver}>
                  Game Over!
                </MessageContainer>
              </BoardHeaderContainer>
              <BoardBodyContainer>
                <Board
                  squares={map}
                  onButtonClick={this.onButtonClick}
                  gameOver={gameOver}
                />
              </BoardBodyContainer>
            </BoardWrapperContainer>
          ) : (
            <MenuContainer>
              <h2>Welcome to this WebSocket powered Minesweeper!</h2>
              <h2>Pick your level to start</h2>
              <CoolButton
                text='Beginner'
                onButtonClick={this.setLevelAndStartGame.bind(this, '1')}
              />
              <CoolButton
                text='Intermediate'
                onButtonClick={this.setLevelAndStartGame.bind(this, '2')}
              />
              <CoolButton
                text='Master'
                onButtonClick={this.setLevelAndStartGame.bind(this, '3')}
              />
              <CoolButton
                text='King'
                onButtonClick={this.setLevelAndStartGame.bind(this, '4')}
              />
            </MenuContainer>
          )}
        </GameContainer>
      </div>
    );
  }
}

export default Game;
