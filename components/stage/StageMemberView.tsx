/** @jsxRuntime classic */
/** @jsx jsx */
import * as React from 'react';
import { jsx, Flex, Box, Heading, IconButton } from 'theme-ui';
import { BsArrowsAngleExpand, BsArrowsAngleContract } from 'react-icons/bs';
import { HiUserCircle } from 'react-icons/hi';
import {
  StageMemberWithUserData,
  useIsStageAdmin,
  useSelector,
  useStageActions,
} from '../../lib/use-digital-stage';
import OnlineStatus from './OnlineStatus';
import useVideoConsumersByStageMember from '../../lib/use-digital-stage/hooks/useVideoConsumersByStageMember';
import { useEffect, useState } from 'react';
import { VscMirror } from 'react-icons/vsc';
import VideoPlayer from '../../digitalstage-ui/extra/VideoPlayer';

const StageMemberTitle = (props: { stageMember: StageMemberWithUserData; withIcon?: boolean }) => {
  const { stageMember, withIcon } = props;

  const { updateStageMember } = useStageActions();
  const isAdmin = useIsStageAdmin();

  return (
    <Flex
      sx={{
        flexDirection: withIcon ? 'column' : 'row',
        textAlign: 'center',
        alignItems: 'center',
        height: withIcon ? '100%' : 'auto',
        justifyContent: 'center',
      }}
    >
      {withIcon && <HiUserCircle size={60} sx={{ color: 'gray.3' }} />}
      <Box
        sx={{
          position: !withIcon ? 'absolute' : 'static',
          display: !withIcon ? 'flex' : 'block',
          alignItems: 'center',
          bottom: '0px',
          left: '0px',
          bg: !withIcon ? 'transparentGray' : 'transparent',
          p: isAdmin ? 0 : 3,
          pl: 3,
        }}
      >
        <OnlineStatus online={stageMember.online} />
        <Heading
          as="h5"
          sx={{ display: withIcon ? 'block' : 'inline-block', ml: withIcon ? 0 : 2 }}
        >
          {stageMember.name}
        </Heading>

        {isAdmin && (
          <IconButton
            onClick={() =>
              updateStageMember(stageMember._id, {
                isDirector: !props.stageMember.isDirector,
              })
            }
            variant="tertiary"
            sx={{ border: 0, width: '32px', height: '32px', p: 0, boxShadow: 'none', m: 2 }}
          >
            {stageMember.isDirector ? <BsArrowsAngleContract /> : <BsArrowsAngleExpand />}
          </IconButton>
        )}
      </Box>
    </Flex>
  );
};

const StageMemberView = ({
  stageMember,
}: {
  stageMember: StageMemberWithUserData;
}): JSX.Element => {
  const videoConsumers = useVideoConsumersByStageMember(stageMember._id);
  const userId = useSelector<string>((state) => state.global.userId);
  const [mirrored, setMirrored] = useState<boolean>(false);

  useEffect(() => {
    if (userId && userId === stageMember.userId) {
      setMirrored(true);
    }
  }, [stageMember, userId]);

  return (
    <Box
      sx={{
        position: 'relative',
        backgroundImage: videoConsumers.length <= 0 && 'url("/images/user_background.svg")',
        height: '100%',
        width: '100%',
      }}
    >
      {videoConsumers.length > 0 && (
        <VideoPlayer sx={{ position: 'relative' }} consumers={videoConsumers} mirrored={mirrored} />
      )}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
        }}
      >
        <IconButton
          onClick={() => setMirrored((prev) => !prev)}
          variant={mirrored ? 'white' : 'tertiary'}
          sx={{ border: 0, width: '32px', height: '32px', p: 0, boxShadow: 'none', m: 2 }}
        >
          <VscMirror />
        </IconButton>
      </Box>
      <StageMemberTitle stageMember={stageMember} withIcon={videoConsumers.length <= 0} />
    </Box>
  );
};

export default StageMemberView;
