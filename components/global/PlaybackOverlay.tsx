/** @jsxRuntime classic */
/** @jsx jsx */
import React from 'react';
import { useAuth } from '../../lib/useAuth';
import useAudioContext from '../../lib/useAudioContext';
import { FaPlay } from 'react-icons/fa';
import { Flex, jsx } from 'theme-ui';

const PlaybackOverlay = (): JSX.Element => {
  const { user } = useAuth();
  const { started, start } = useAudioContext();

  if (user && !started) {
    return (
      <Flex
        onClick={start}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          bg: 'modalBg',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <FaPlay size="128px" name="Start" />
      </Flex>
    );
  }
  return null;
};
export default PlaybackOverlay;
