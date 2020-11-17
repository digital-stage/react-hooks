/** @jsxRuntime classic */
/** @jsx jsx */
import * as React from 'react';
import { jsx, Flex } from 'theme-ui';
import { useRouter } from 'next/router';
import { DisplayMedium } from 'baseui/typography';
import { useRequest } from '../../../lib/useRequest';
import Loading from '../../../components/new/elements/Loading';

const Join = (): JSX.Element => {
  const router = useRouter();

  const { setRequest } = useRequest();

  React.useEffect(() => {
    router.prefetch('/');
  }, []);

  React.useEffect(() => {
    if (router.query) {
      const { stageId, groupId, password } = router.query;
      if (stageId && groupId && !Array.isArray(stageId) && !Array.isArray(groupId)) {
        if (password && !Array.isArray(password)) {
          setRequest(stageId, groupId, password);
        } else {
          setRequest(stageId, groupId);
        }
        router.push('/');
      }
    }
  }, [router.query]);

  return (
    <Loading>
      <DisplayMedium>Lade...</DisplayMedium>
    </Loading>
  );
};

export default Join;