import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import NetInfo from "@react-native-community/netinfo";
const net = require('net');
import TcpSocket from 'react-native-tcp-socket';

const App = () => {

  const [chatters, setChatters] = useState([]);
  const [ipAddress, setIpAddress] = useState('');

  const PORT = 12017;

  useEffect(() => {
    checkNetwork();
  }, []);

  const checkNetwork = () => {
    NetInfo.fetch('wifi').then(info => {
      const currentIpAddress = info.details.ipAddress;
      // const currentIpAddress = '0.0.0.0';

      setIpAddress(currentIpAddress);
      initServer(currentIpAddress);
      initClient(currentIpAddress);

      console.log("My Ip Address", info);
    });
  };

  const updateChatter = (msg) => {
    setChatters((oldValue) => {
      return oldValue.concat([msg]);
    });
  };

  const initServer = (ipAddress) => {
    const server = new net.Server();

    server.on('connection', (socket) => {
      updateChatter('------------- [Server] -------------');
      updateChatter('[Server] Client connected to server on ' + JSON.stringify(socket.address()));

      socket.on('data', (data) => {
        updateChatter('[Server] Server client received: ' + data);
      });

      socket.on('error', (error) => {
        updateChatter('[Server] Server client error ' + error);
      });

      socket.on('close', (error) => {
        updateChatter('[Server] Server client closed ' + (error ? error : ''));
      });
    });

    server.listen({ port: PORT, host: ipAddress });

    server.on('error', (error) => {
      updateChatter(error);
      updateChatter('[Server] Server error ' + error);
    });

    server.on('close', () => {
      updateChatter('[Server] Server closed');
    });
  };

  const initClient = (ipAddress) => {
    // Create socket
    const client = TcpSocket.createConnection({
      port: PORT,
      host: ipAddress
    }, () => {
      updateChatter('------------- [Client] -------------');
      // Write on the socket
      client.write('Hello server!');
      updateChatter('Hello server!');
      // Close socket
      // client.destroy();
    });

    client.on('data', function (data) {
      updateChatter('message was received', data);
    });

    client.on('error', function (error) {
      updateChatter(error);
    });

    client.on('close', function () {
      updateChatter('Connection closed!');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text>SERVER</Text>
      <Text>ipAddress: {ipAddress}</Text>
      <Text>port: {PORT}</Text>
      <ScrollView>
        {chatters.map((msg, index) => {
          return (
            <Text key={index} style={styles.welcome}>
              {index} {msg}
            </Text>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcome: {
    marginBottom: 20,
    marginLeft: 10
  }
});

export default App;
