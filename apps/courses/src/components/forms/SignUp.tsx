import React from 'react';
import { Button, Divider, Flex, Icon, Text, Link } from '@chakra-ui/core';
import { Link as RRDLink } from 'react-router-dom';
import * as yup from 'yup';
import { useAuth, useFirestore } from 'reactfire';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

import Form from './_form';
import {
  validEmail,
  validPassword,
  validMatchingPassword,
  requiredString,
} from './_validation';

import useToast, { toastConfig } from '../Toast';
import { handleErrors } from '../../helpers';

interface SignUpFormProps {
  callback?: () => void;
}

export default ({ callback }: SignUpFormProps) => {
  const auth = useAuth();
  const db = useFirestore();
  const toast = useToast();

  const provider = new useAuth.GithubAuthProvider();

  provider.addScope('repo');
  provider.addScope('read:user');
  provider.addScope('user.email');

  const onSuccess = () => {
    toast({
      ...toastConfig,
      title: 'Sign up successful',
      description: 'Welcome to OpenMined Courses!',
      status: 'success',
    });
    if (callback) callback();
  };

  const onSubmit = ({ email, password, first_name, last_name }) =>
    auth
      .createUserWithEmailAndPassword(email, password)
      .then(() =>
        auth.currentUser
          .sendEmailVerification()
          .then(() =>
            db
              .collection('users')
              .doc(auth.currentUser.uid)
              .set({
                first_name: first_name,
                last_name: last_name,
              })
              .then(onSuccess)
              .catch((error) => handleErrors(toast, error))
          )
          .catch((error) => handleErrors(toast, error))
      )
      .catch((error) => handleErrors(toast, error));

  const onGithubSubmit = async () => {
    const authUser = await auth
      .signInWithPopup(provider)
      .catch((error) => handleErrors(toast, error));

    const splitName = authUser.user.displayName.split(' ');
    const firstName =
      splitName.length >= 1 ? splitName[0] : authUser.user.displayName;
    const lastName = splitName.length >= 2 ? splitName.slice(1).join(' ') : '';

    const databaseUser = db
      .collection('users')
      .doc(auth.currentUser.uid)
      .set({
        first_name: firstName,
        last_name: lastName,
      })
      .catch((error) => handleErrors(toast, error));

    if (authUser && databaseUser) onSuccess();
  };

  const schema = yup.object().shape({
    first_name: requiredString,
    last_name: requiredString,
    email: validEmail,
    password: validPassword,
    passwordConfirm: validMatchingPassword('password'),
  });

  const fields = [
    [
      {
        name: 'first_name',
        type: 'text',
        placeholder: 'Ada',
        label: 'First Name',
      },
      {
        name: 'last_name',
        type: 'text',
        placeholder: 'Lovelace',
        label: 'Last Name',
      },
    ],
    {
      name: 'email',
      type: 'email',
      placeholder: 'ada.lovelace@openmined.org',
      label: 'Email Address',
    },
    [
      {
        name: 'password',
        type: 'password',
        placeholder: 'Password',
        label: 'Password',
      },
      {
        name: 'passwordConfirm',
        type: 'password',
        placeholder: 'Password confirmation',
      },
    ],
  ];

  return (
    <Form
      onSubmit={onSubmit}
      schema={schema}
      fields={fields}
      submit={(isDisabled, isSubmitting) => (
        <>
          <Flex align="center" wrap="wrap" mt={6}>
            <Button
              mr={4}
              mt={2}
              colorScheme="black"
              type="submit"
              disabled={isDisabled}
              isLoading={isSubmitting}
            >
              Sign Up
            </Button>
            <Button
              mt={2}
              onClick={onGithubSubmit}
              colorScheme="black"
              isLoading={isSubmitting}
            >
              {/* TODO: Icons are kinda ugly like this, do something about it when we import OMUI to the monorepo */}
              Sign Up with Github{' '}
              <Icon
                as={FontAwesomeIcon}
                icon={faGithub}
                ml={2}
                boxSize={4}
                color="white"
              />
            </Button>
          </Flex>
          <Divider my={6} />
          <Text fontSize="sm" color="gray.700">
            By signing up you agree to our{' '}
            <Link as={RRDLink} to="/terms">
              Terms of Use
            </Link>{' '}
            and{' '}
            <Link as={RRDLink} to="/policy">
              Privacy Policy
            </Link>
            .
          </Text>
        </>
      )}
    />
  );
};
