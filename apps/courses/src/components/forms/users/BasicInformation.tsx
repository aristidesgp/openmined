import React from 'react';
import { BoxProps, Flex, Link } from '@chakra-ui/core';
import * as yup from 'yup';
import { useUser, useFirestore, useFirestoreDocData, useAuth } from 'reactfire';
import { User } from '@openmined/shared/types';

import Form from '../_form';
import { requiredString, optionalString, optionalItem } from '../_validation';
import {
  readOnlyEmailField,
  firstNameField,
  lastNameField,
  skillLevelField,
  primaryLanguageField,
  cityField,
  countryField,
  timezoneField,
} from '../_fields';

import useToast, { toastConfig } from '../../Toast';
import { handleErrors } from '../../../helpers';
import { countries, primaryLanguages, skillLevels, timezones } from '../_data';

interface BasicInformationFormProps extends BoxProps {
  callback?: () => void;
  onChangeEmail: () => void;
  onAddPassword: () => void;
}

export default ({
  callback,
  onChangeEmail,
  onAddPassword,
  ...props
}: BasicInformationFormProps) => {
  const user = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const toast = useToast();

  // @ts-ignore
  const dbUserRef = db.collection('users').doc(user.uid);
  const dbUser: User = useFirestoreDocData(dbUserRef);

  const onSuccess = () => {
    toast({
      ...toastConfig,
      title: 'Account updated',
      description: 'We have successfully changed your account information.',
      status: 'success',
    });
    if (callback) callback();
  };

  const onReverifySuccess = () => {
    toast({
      ...toastConfig,
      title: 'Email verification sent',
      description: 'We have sent you an email to verify your account.',
      status: 'success',
    });
    if (callback) callback();
  };

  const onSubmit = (data: User) =>
    db
      .collection('users')
      // @ts-ignore
      .doc(user.uid)
      .set(data, { merge: true })
      .then(onSuccess)
      .catch((error) => handleErrors(toast, error));

  const onReverifyEmail = (data) =>
    auth.currentUser
      .sendEmailVerification()
      .then(onReverifySuccess)
      .catch((error) => handleErrors(toast, error));

  const schema = yup.object().shape({
    first_name: requiredString,
    last_name: requiredString,
    skill_level: optionalItem(skillLevels),
    primary_language: optionalItem(primaryLanguages.map((d) => d.code)),
    city: optionalString,
    country: optionalItem(countries.map((d) => d.code)),
    timezone: optionalItem(timezones.map((d) => d.name)),
  });

  // @ts-ignore
  const hasPasswordAccount = !!user.providerData.filter(
    (p) => p.providerId === 'password'
  ).length;

  const fields = [
    // @ts-ignore
    readOnlyEmailField(user.email, (props) => (
      <Flex {...props}>
        {hasPasswordAccount && <Link onClick={onChangeEmail}>Change</Link>}
        {!hasPasswordAccount && (
          <Link onClick={onAddPassword}>Add Password</Link>
        )}
        {/* @ts-ignore */}
        {!user.emailVerified && (
          <Link color="red.500" ml={4} onClick={onReverifyEmail}>
            Resend Verification Email
          </Link>
        )}
      </Flex>
    )),
    [firstNameField(dbUser.first_name), lastNameField(dbUser.last_name)],
    skillLevelField(dbUser.skill_level),
    [primaryLanguageField(dbUser.primary_language), null],
    [cityField(dbUser.city), countryField(dbUser.country)],
    [timezoneField(dbUser.timezone), null],
  ];

  return (
    <Form
      {...props}
      onSubmit={onSubmit}
      schema={schema}
      fields={fields}
      submit="Save Changes"
      isBreathable
    />
  );
};
