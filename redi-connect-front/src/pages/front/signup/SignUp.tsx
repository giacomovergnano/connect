import React, { useState } from 'react'
import AccountOperation from '../../../components/templates/AccountOperation'
import { useParams } from 'react-router'

import * as Yup from 'yup'

import {
  FormikValues,
  FormikHelpers as FormikActions,
  useFormik
} from 'formik'
import omit from 'lodash/omit'

import FormInput from '../../../components/atoms/FormInput'
import FormCheckbox from '../../../components/atoms/FormCheckbox'

import Teaser from '../../../components/molecules/Teaser'

import { Columns, Form, Heading } from 'react-bulma-components'

import Button from '../../../components/atoms/Button'

import { signUp } from '../../../services/api/api'
import { RedProfile } from '../../../types/RedProfile'
import { Extends } from '../../../types/utility-types/Extends'
import { history } from '../../../services/history/history'

import { courses } from '../../../config/config'

export const validationSchema = Yup.object({
  firstName: Yup.string()
    .required()
    .max(255),
  lastName: Yup.string()
    .required()
    .max(255),
  username: Yup.string()
    .email()
    .label('Email')
    .max(255),
  password: Yup.string()
    .min(8, 'Password must contain at least 8 characters')
    .required('Enter your password')
    .label('Password'),
  passwordConfirm: Yup.string()
    .required('Confirm your password')
    .oneOf([Yup.ref('password')], 'Password does not match'),
  agreesWithCodeOfConduct: Yup.boolean()
    .required()
    .oneOf([true]),
  gaveGdprConsent: Yup.boolean()
    .required()
    .oneOf([true]),
  mentee_currentlyEnrolledInCourse: Yup.string().when('userType', {
    is: 'public-sign-up-mentee-pending-review',
    then: Yup.string()
      .required()
      .oneOf(courses.map(level => level.id))
      .label('Currently enrolled in course')
  })
})

type SignUpPageType = {
  type: | 'mentor' | 'mentee'
}

type SignUpUserType = Extends<
  RedProfile['userType'],
  'public-sign-up-mentee-pending-review' | 'public-sign-up-mentor-pending-review'
>

export interface SignUpFormValues {
  userType: SignUpUserType
  gaveGdprConsent: boolean
  username: string
  password: string
  passwordConfirm: string
  firstName: string
  lastName: string
  agreesWithCodeOfConduct: boolean
  mentee_currentlyEnrolledInCourse: string
}

export default function SignUp () {
  const { type } = useParams<SignUpPageType>()

  // we may consider removing the backend types from frontend
  const userType: SignUpUserType = (type === 'mentee')
    ? 'public-sign-up-mentee-pending-review'
    : 'public-sign-up-mentor-pending-review'

  const initialValues: SignUpFormValues = {
    userType,
    gaveGdprConsent: false,
    username: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: '',
    agreesWithCodeOfConduct: false,
    mentee_currentlyEnrolledInCourse: ''
  }

  const [submitError, setSubmitError] = useState(false)
  const submitForm = async (
    values: FormikValues,
    actions: FormikActions<SignUpFormValues>
  ) => {
    setSubmitError(false)
    const profile = values as Partial<RedProfile>
    // TODO: this needs to be done in a smarter way, like iterating over the RedProfile definition or something
    const cleanProfile: Partial<RedProfile> = omit(profile, [
      'password',
      'passwordConfirm',
      'agreesWithCodeOfConduct',
      'gaveGdprConsent'
    ])
    cleanProfile.userActivated = false
    cleanProfile.signupSource = 'public-sign-up'
    try {
      await signUp(values.username, values.password, cleanProfile)
      actions.setSubmitting(false)
      history.push('/front/signup-email-verification')
    } catch (error) {
      actions.setSubmitting(false)
      setSubmitError(Boolean(error))
    }
  }

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema,
    onSubmit: submitForm
  })

  const onChange = (name: any, e: any) => {
    e.persist()
    formik.handleChange(e)
    formik.setFieldTouched(name, true, false)
  }

  const determineInputColor = (field: keyof SignUpFormValues) =>
    formik.touched[field] && Boolean(formik.errors[field]) ? 'danger' : null

  return (
    <AccountOperation>
      <Columns vCentered>
        <Columns.Column
          size={6}
          responsive={{ mobile: { hide: { value: true } } }}
        >
          <Teaser.SignIn />
        </Columns.Column>

        <Columns.Column size={5} offset={1}>
          <Heading
            size={1}
            weight="normal"
            renderAs="h1"
            responsive={{ mobile: { textSize: { value: 2 } } }}
            className="title--border"
          >
            Sign-up
          </Heading>
          <form onSubmit={e => e.preventDefault()} className="form">
            <FormInput
              name="firstName"
              value={formik.values.firstName}
              placeholder="First name"
              setFieldTouched={formik.setFieldTouched}
              handleChange={formik.handleChange}
              isSubmitting={formik.isSubmitting}
              hasError={!!formik.touched.firstName && !!formik.errors.firstName}
            />

            <FormInput
              name="lastName"
              value={formik.values.lastName}
              placeholder="Last name"
              setFieldTouched={formik.setFieldTouched}
              handleChange={formik.handleChange}
              isSubmitting={formik.isSubmitting}
              hasError={!!formik.touched.lastName && !!formik.errors.lastName}
            />

            <FormInput
              name="username"
              type="email"
              value={formik.values.username}
              placeholder="Username (your email address)"
              setFieldTouched={formik.setFieldTouched}
              handleChange={formik.handleChange}
              isSubmitting={formik.isSubmitting}
              hasError={!!formik.touched.username && !!formik.errors.username}
            />

            <FormInput
              name="password"
              type="password"
              value={formik.values.password}
              placeholder="Password"
              setFieldTouched={formik.setFieldTouched}
              handleChange={formik.handleChange}
              isSubmitting={formik.isSubmitting}
              hasError={!!formik.touched.password && !!formik.errors.password}
            />

            <FormInput
              name="passwordConfirm"
              type="password"
              value={formik.values.passwordConfirm}
              placeholder="Repeat password"
              setFieldTouched={formik.setFieldTouched}
              handleChange={formik.handleChange}
              isSubmitting={formik.isSubmitting}
              hasError={
                !!formik.touched.passwordConfirm &&
                !!formik.errors.passwordConfirm
              }
            />
            {type === 'mentee' && (
              <>
                <Form.Field>
                  <Form.Label size="small">
                    Current ReDI Course (*for alumni last taken course)
                  </Form.Label>
                  <Form.Control>
                    <Form.Select
                      name="mentee_currentlyEnrolledInCourse"
                      className="is-fullwidth"
                      value={formik.values.mentee_currentlyEnrolledInCourse}
                      onChange={onChange.bind(
                        null,
                        'mentee_currentlyEnrolledInCourse'
                      )}
                      color={determineInputColor(
                        'mentee_currentlyEnrolledInCourse'
                      )}
                    >
                      <option id="" value="" disabled>
                        Your current ReDI Course
                      </option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Control>
                </Form.Field>
              </>
            )}

            <FormCheckbox
              name="agreesWithCodeOfConduct"
              checked={formik.values.agreesWithCodeOfConduct}
              setFieldTouched={formik.setFieldTouched}
              handleChange={formik.handleChange}
              isSubmitting={formik.isSubmitting}
              className="submit-spacer"
            >
              I agree to the{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://connect.redi-school.org/downloadeables/redi-connect-code-of-conduct.pdf"
              >
                Code of Conduct
              </a>{' '}
                of the ReDI School
            </FormCheckbox>

            <FormCheckbox
              name="gaveGdprConsent"
              checked={formik.values.gaveGdprConsent}
              setFieldTouched={formik.setFieldTouched}
              handleChange={formik.handleChange}
              isSubmitting={formik.isSubmitting}
            >
              I give permission to the ReDI School Terms stated in the{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.redi-school.org/data-privacy-policy"
              >
                Data Protection
              </a>
            </FormCheckbox>

            <Form.Field>
              {submitError && (
                <Form.Help color="danger">
                  An error occurred, please try again.
                </Form.Help>
              )}
            </Form.Field>
            <Form.Field>
              <Form.Control>
                <Button
                  fullWidth
                  onClick={() => formik.handleSubmit()}
                  disabled={!(formik.dirty && formik.isValid)}
                >submit</Button>
              </Form.Control>
            </Form.Field>
          </form>
        </Columns.Column>
      </Columns>
    </AccountOperation>
  )
}
