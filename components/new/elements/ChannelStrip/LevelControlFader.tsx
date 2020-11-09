/** @jsxRuntime classic */
/** @jsx jsx */
import * as React from 'react';
import {
  jsx, Box, Button, Flex,
} from 'theme-ui';
import LogSlider, { RGBColor } from '../LogSlider';

const LevelControlFader = (props: {
  muted: boolean;
  volume: number;
  color?: RGBColor;
  onChanged: (volume: number, muted: boolean) => any;
  alignLabel?: 'left' | 'right';
}) => {
  const {
    volume, onChanged, muted, color, alignLabel,
  } = props;
  const [value, setValue] = React.useState<number>(volume);

  React.useEffect(() => {
    setValue(volume);
  }, [volume]);

  const handleMuteClicked = React.useCallback(() => {
    onChanged(value, !muted);
  }, [value, muted]);

  const handleEnd = React.useCallback(
    (updatedVolume: number) => {
      setValue(updatedVolume);
      onChanged(updatedVolume, muted);
    },
    [muted],
  );

  return (
    <Flex sx={{
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}
    >
      <Box sx={{
        display: 'block',
        paddingBottom: '.6rem',
      }}
      >
        <Button
          kind={muted ? 'primary' : 'minimal'}
          shape="circle"
          aria-label="mute"
          onClick={handleMuteClicked}
        >
          M
        </Button>
      </Box>
      <LogSlider
        min={0}
        middle={1}
        max={4}
        width={16}
        color={color || [255, 255, 255]}
        volume={value}
        onChange={(changedVolume) => setValue(changedVolume)}
        onEnd={handleEnd}
        alignLabel={alignLabel}
      />
    </Flex>
  );
};
export default LevelControlFader;
