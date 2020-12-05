import React, { useState } from 'react';
import {
  Box,
  Flex,
  Image,
  Heading,
  Text,
  Stack,
  Icon,
  Progress,
} from '@chakra-ui/core';
import { useFirestore, useUser } from 'reactfire';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faCircle, faDotCircle } from '@fortawesome/free-regular-svg-icons';

const FinishedBox = ({ correct, total }) => (
  <Box bg="gray.100" borderRadius="md" p={8}>
    <Heading as="p" textAlign="center" size="md" mb={4}>
      Great work!
    </Heading>
    <Flex
      bg="gray.800"
      color="white"
      borderRadius="md"
      border="1px solid"
      borderColor="gray.900"
    >
      <Flex
        direction="column"
        justify="center"
        align="center"
        borderRight="1px solid"
        borderColor="gray.900"
        textAlign="center"
        p={8}
        width={1 / 2}
      >
        <Heading size="3xl" mb={3}>
          {correct}
        </Heading>
        <Text color="teal.300">Correct</Text>
      </Flex>
      <Flex
        direction="column"
        justify="center"
        align="center"
        textAlign="center"
        p={8}
        width={1 / 2}
      >
        <Heading size="3xl" mb={3}>
          {total}
        </Heading>
        <Text color="gray.400">Total Questions</Text>
      </Flex>
    </Flex>
  </Box>
);

const submittedAnswerProps = {
  p: 3,
  border: '1px solid',
  borderRadius: 'md',
  cursor: 'pointer',
  align: 'flex-start',
};

const CorrectAnswer = ({ setCurrentAnswer, index, value, explanation }) => (
  <Flex
    bg="teal.50"
    {...submittedAnswerProps}
    borderColor="teal.500"
    onClick={() => setCurrentAnswer(index)}
  >
    <Image
      src="https://emojis.slackmojis.com/emojis/images/1531847402/4229/blob-clap.gif?1531847402"
      alt="Correct answer"
      boxSize={6}
      ml={-1}
      mr={3}
    />
    <Box>
      <Text mb={1}>{value}</Text>
      <Text color="teal.500" fontSize="sm" fontStyle="italic">
        {explanation}
      </Text>
    </Box>
  </Flex>
);

const IncorrectAnswer = ({ setCurrentAnswer, index, value, explanation }) => (
  <Flex
    bg="red.50"
    {...submittedAnswerProps}
    borderColor="red.300"
    onClick={() => setCurrentAnswer(index)}
  >
    <Icon
      as={FontAwesomeIcon}
      icon={faTimes}
      color="red.300"
      size="lg"
      mr={4}
    />
    <Box>
      <Text mb={1}>{value}</Text>
      <Text color="red.300" fontSize="sm" fontStyle="italic">
        {explanation}
      </Text>
    </Box>
  </Flex>
);

const UnansweredAnswer = ({
  setCurrentAnswer,
  index,
  value,
  correct,
  setCorrectAnswers,
  correctAnswers,
}) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <Flex
      p={3}
      align="center"
      _hover={{ bg: 'gray.200' }}
      transitionProperty="background, color"
      transitionDuration="slow"
      transitionTimingFunction="ease-in-out"
      borderRadius="md"
      cursor="pointer"
      onClick={() => {
        setCurrentAnswer(index);
        setIsHovering(false);

        if (correct) setCorrectAnswers(correctAnswers + 1);
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Icon
        as={FontAwesomeIcon}
        icon={isHovering ? faDotCircle : faCircle}
        color={isHovering ? 'blue.500' : 'gray.700'}
        size="1x"
        mr={4}
      />
      <Text color={isHovering ? 'gray.800' : 'gray.700'}>{value}</Text>
    </Flex>
  );
};

const QuizCard = ({
  question,
  answers,
  index,
  currentQuestion,
  currentAnswer,
  setCurrentAnswer,
  setCurrentQuestion,
  setCorrectAnswers,
  correctAnswers,
  setIsFinished,
  onFinish,
  total,
}) => (
  <Box
    bg="gray.100"
    borderRadius="md"
    p={8}
    display={currentQuestion === index ? 'block' : 'none'}
  >
    <Text mb={4}>{question}</Text>
    <Stack spacing={2}>
      {answers.map(({ value, explanation, correct }, answerIndex) => {
        if (
          currentQuestion === index &&
          currentAnswer === answerIndex &&
          correct
        ) {
          return (
            <CorrectAnswer
              key={answerIndex}
              setCurrentAnswer={setCurrentAnswer}
              index={answerIndex}
              value={value}
              explanation={explanation}
            />
          );
        } else if (
          currentQuestion === index &&
          currentAnswer === answerIndex &&
          !correct
        ) {
          return (
            <IncorrectAnswer
              key={answerIndex}
              setCurrentAnswer={setCurrentAnswer}
              index={answerIndex}
              value={value}
              explanation={explanation}
            />
          );
        }

        return (
          <UnansweredAnswer
            key={answerIndex}
            setCurrentAnswer={setCurrentAnswer}
            index={answerIndex}
            value={value}
            correct={correct}
            setCorrectAnswers={setCorrectAnswers}
            correctAnswers={correctAnswers}
          />
        );
      })}
    </Stack>
    {currentAnswer !== null && (
      <Flex justify="flex-end" mt={4}>
        <Flex
          align="center"
          color="gray.700"
          _hover={{ color: 'gray.800' }}
          transitionProperty="color"
          transitionDuration="slow"
          transitionTimingFunction="ease-in-out"
          cursor="pointer"
          onClick={() => {
            if (currentQuestion + 1 >= total) {
              setIsFinished(true);
              onFinish();
            } else {
              setCurrentAnswer(null);
              setCurrentQuestion(currentQuestion + 1);
            }
          }}
        >
          <Text fontWeight="bold" mr={2}>
            {currentQuestion + 1 >= total ? 'Finish' : 'Next'}
          </Text>
          <Icon as={FontAwesomeIcon} icon={faArrowRight} size="1x" />
        </Flex>
      </Flex>
    )}
  </Box>
);

export default ({
  quiz,
  course,
  lesson,
  concept,
  dbCourse,
  numQuizzes,
  spacing,
  onComplete,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const user = useUser();
  const db = useFirestore();

  const arrayUnion = useFirestore.FieldValue.arrayUnion;

  const onFinish = () => {
    onComplete();

    const numQuizzesInDb = dbCourse.lessons[lesson].concepts[concept].quizzes
      ? dbCourse.lessons[lesson].concepts[concept].quizzes.length
      : 0;

    if (numQuizzesInDb < numQuizzes) {
      const percentage = (correctAnswers / quiz.length) * 100;

      db.collection('users')
        .doc(user.uid)
        .collection('courses')
        .doc(course)
        .set(
          {
            lessons: {
              [lesson]: {
                concepts: {
                  [concept]: {
                    quizzes: arrayUnion({
                      correct: correctAnswers,
                      total: quiz.length,
                      percentage,
                    }),
                  },
                },
              },
            },
          },
          { merge: true }
        );
    }
  };

  return (
    <Box my={spacing}>
      <Flex justify="space-between" align="center">
        <Flex align="center">
          <Image
            src="https://emojis.slackmojis.com/emojis/images/1572027739/6832/blob_cheer.png?1572027739"
            alt="Quiz Emoji"
            boxSize={10}
            mr={4}
          />
          <Heading as="span" size="lg">
            Quiz Time
          </Heading>
        </Flex>
        <Text color="gray.600">
          {currentQuestion + 1} of {quiz.length}
        </Text>
      </Flex>
      <Progress
        value={isFinished ? 100 : (currentQuestion / quiz.length) * 100}
        size="sm"
        colorScheme="blue"
        borderRadius="md"
        my={6}
      />
      {isFinished && (
        <FinishedBox correct={correctAnswers} total={quiz.length} />
      )}
      {!isFinished &&
        quiz.map(({ question, answers }, questionIndex) => (
          <QuizCard
            key={questionIndex}
            question={question}
            answers={answers}
            index={questionIndex}
            currentQuestion={currentQuestion}
            currentAnswer={currentAnswer}
            setCurrentAnswer={setCurrentAnswer}
            setCurrentQuestion={setCurrentQuestion}
            setCorrectAnswers={setCorrectAnswers}
            correctAnswers={correctAnswers}
            setIsFinished={setIsFinished}
            onFinish={onFinish}
            total={quiz.length}
          />
        ))}
    </Box>
  );
};
