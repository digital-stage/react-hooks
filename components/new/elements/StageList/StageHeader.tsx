/** @jsxRuntime classic */
/** @jsx jsx */
import * as React from 'react';
import { jsx, Box, Flex, IconButton, Heading, Avatar, Text } from 'theme-ui';
import { FaPen, FaTrash } from 'react-icons/fa';
import ModifyStageModal from './ModifyStageModal';
import useStageActions from '../../../../lib/use-digital-stage/useStageActions';
import { Stage } from '../../../../lib/use-digital-stage/types';
import { useCurrentUser } from '../../../../lib/use-digital-stage/hooks';

const StageHeader = (props: { stage: Stage }): JSX.Element => {
  const { removeStage, leaveStageForGood } = useStageActions();
  const [currentStage, setCurrentStage] = React.useState<Stage>();
  const { _id: userId } = useCurrentUser();
  const [isModifyStageOpen, setModifyStageIsOpen] = React.useState<boolean>(false);

  const { stage } = props;
  const isAdmin = stage.admins.indexOf(userId) !== -1;
  return (
    <Box sx={{ width: '100%', py: '24px' }}>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Flex>
          <Avatar src="/images/diverse 5.svg" sx={{ my: 'auto', mr: 2 }} />
          <Flex sx={{ flexDirection: 'column' }}>
            <Heading as="h3" sx={{ color: 'gray.0', flexBasis: 'max-content' }}>
              {stage.name}
            </Heading>
            <Flex>
              <Text variant="subTitle" sx={{ color: 'text' }}>
                {isAdmin && 'Du verwaltest diese Bühne'}
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Box sx={{ color: 'secondary' }}>
          <IconButton
            aria-label="Bühne bearbeiten"
            onClick={() => {
              setCurrentStage(stage);
              setModifyStageIsOpen(true);
            }}
          >
            <FaPen />
          </IconButton>
          <IconButton
            aria-label={isAdmin ? 'Bühne entfernen' : 'Bühne verlassen'}
            onClick={() => {
              if (isAdmin) removeStage(stage._id);
              else leaveStageForGood(stage._id);
            }}
          >
            <FaTrash />
          </IconButton>
        </Box>
      </Flex>
      <ModifyStageModal
        stage={currentStage}
        isOpen={isModifyStageOpen}
        onClose={() => setModifyStageIsOpen(false)}
      />
    </Box>
  );
};

export default StageHeader;
