import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Icon,
  Switch,
  Text,
} from '@chakra-ui/react';
import Page from '@openmined/shared/util-page';
import { User } from '@openmined/shared/types';
import {
  useUser,
  useFirestoreDocDataOnce,
  useFirestore,
  useFirestoreCollectionData,
} from 'reactfire';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { StudentContext, StudentTabs, studentResources } from './Student';
import { MentorContext, MentorTabs, mentorResources } from './Mentor';

import GridContainer from '../../../components/GridContainer';
import { getLinkPropsFromLink } from '../../../helpers';
import { useSanity } from '@openmined/shared/data-access-sanity';

dayjs.extend(relativeTime);

const LinkItem = ({ title, icon, link, ...props }) => (
  <Flex
    {...props}
    {...getLinkPropsFromLink(link)}
    align="center"
    p={3}
    width="full"
    color="gray.700"
    borderRadius="md"
    _hover={{ bg: 'cyan.50', color: 'cyan.500' }}
    transitionProperty="background color"
    transitionDuration="normal"
    transitionTimingFunction="ease-in-out"
  >
    {/* SEE TODO (#3) */}
    <Icon as={FontAwesomeIcon} icon={icon} size="lg" color="inherit" mr={3} />
    <Text color="inherit">{title}</Text>
  </Flex>
);

const MENTOR_MODE_KEY = '@openmined/mentor-mode';

export default () => {
  const user: firebase.User = useUser();
  const db = useFirestore();

  const dbUserRef = db.collection('users').doc(user.uid);
  const dbUser: User = useFirestoreDocDataOnce(dbUserRef);

  const dbCoursesRef = db
    .collection('users')
    .doc(user.uid)
    .collection('courses');
  const dbCourses = useFirestoreCollectionData(dbCoursesRef, {
    idField: 'uid',
  });

  const dbMentorRef = dbUser.is_mentor
    ? db.collection('mentors').doc(user.uid)
    : null;
  const dbMentor: User = dbMentorRef
    ? useFirestoreDocDataOnce(dbMentorRef)
    : null;

  const mentorModeCache = JSON.parse(localStorage.getItem(MENTOR_MODE_KEY));
  const [mentorMode, setMentorMode] = useState(
    (mentorModeCache && mentorModeCache.enabled) || false
  );

  const resources =
    !mentorMode || !dbMentor ? studentResources : mentorResources;

  const { data, loading } = useSanity(`
    *[_type == "course" && visible == true] {
      ...,
      "slug": slug.current,
      visual {
        "default": default.asset -> url,
        "full": full.asset -> url
      },
      lessons[] -> {
        _id,
        title,
        description,
        concepts[] -> {
          _id,
          title
        }
      }
    }`);

  if (loading) return null;

  return (
    <Page title="Dashboard">
      <GridContainer isInitial pt={[8, null, null, 16]} pb={16}>
        <Grid templateColumns="repeat(12, 1fr)" alignItems="center">
          <GridItem colSpan={[12, null, null, 2]} mb={[4, null, null, 0]}>
            <Flex justify={['center', null, null, 'flex-start']}>
              <Avatar src={dbUser.photo_url} size="2xl" />
            </Flex>
          </GridItem>
          <GridItem colSpan={[12, null, null, 10]}>
            <Flex
              direction={['column', null, null, 'row']}
              justify="space-between"
              align="center"
            >
              <Heading as="h1" size="lg" mb={[2, null, null, 0]}>
                Welcome, {dbUser.first_name}!
              </Heading>
              <Flex align="center" ml={[0, null, null, 6]}>
                {dbMentor && (
                  <>
                    <FormControl display="flex" alignItems="center">
                      <Switch
                        id="mentor-mode"
                        size="lg"
                        isChecked={mentorMode}
                        onChange={({ target }) => {
                          setMentorMode(target.checked);

                          localStorage.setItem(
                            MENTOR_MODE_KEY,
                            JSON.stringify({ enabled: target.checked })
                          );
                        }}
                      />
                      <FormLabel
                        htmlFor="mentor-mode"
                        m={0}
                        ml={3}
                        userSelect="none"
                        color="gray.700"
                        fontSize="md"
                        fontWeight="normal"
                      >
                        Mentor Mode
                      </FormLabel>
                    </FormControl>
                    <Divider orientation="vertical" height={6} mx={4} />
                  </>
                )}
                <Text color="gray.700" whiteSpace="nowrap">
                  Last login{' '}
                  {dayjs(
                    user.metadata.lastSignInTime || user.metadata.creationTime
                  ).fromNow()}
                </Text>
              </Flex>
            </Flex>
          </GridItem>
          <GridItem colStart={[1, null, null, 3]} colEnd={13}>
            <Flex direction={['column', null, 'row']} justify="space-between">
              <Box mt={6} width="full">
                {(!mentorMode || !dbMentor) && (
                  <StudentContext courses={data} progress={dbCourses} />
                )}
                {mentorMode && dbMentor && <MentorContext uid={user.uid} />}
              </Box>
              <Box mt={6} ml={[0, null, 6, 12]} minW={240}>
                <Heading as="p" size="md">
                  Resources
                </Heading>
                <Divider my={3} />
                {resources.map((i) => (
                  <LinkItem key={i.title} {...i} />
                ))}
              </Box>
            </Flex>
          </GridItem>
          <GridItem colSpan={12}>
            <Box mt={[8, null, 12, 24]}>
              {(!mentorMode || !dbMentor) && (
                <StudentTabs courses={data} progress={dbCourses} />
              )}
              {mentorMode && dbMentor && <MentorTabs uid={user.uid} />}
            </Box>
          </GridItem>
        </Grid>
      </GridContainer>
    </Page>
  );
};
