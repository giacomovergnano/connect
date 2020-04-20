import React, { useState } from "react";
import * as Yup from "yup";

import {
  FormikValues,
  FormikHelpers as FormikActions,
  useFormik,
} from "formik";
import omit from "lodash/omit";

import FormInput from "../../../components/atoms/FormInput";

import Teaser from "../../../components/molecules/Teaser";

import { Columns, Form, Heading, Button } from "react-bulma-components";

import { signUp } from "../../../services/api/api";
import { RedProfile } from "../../../types/RedProfile";
import { history } from "../../../services/history/history";

import { courses } from "../../../config/config";

export const validationSchema = Yup.object({
  firstName: Yup.string()
    .required()
    .max(255),
  lastName: Yup.string()
    .required()
    .max(255),
  username: Yup.string()
    .email()
    .label("Email")
    .max(255),
  password: Yup.string()
    .min(8, "Password must contain at least 8 characters")
    .required("Enter your password")
    .label("Password"),
  passwordConfirm: Yup.string()
    .required("Confirm your password")
    .oneOf([Yup.ref("password")], "Password does not match"),
  agreesWithCodeOfConduct: Yup.boolean()
    .required()
    .oneOf([true]),
  gaveGdprConsentAt: Yup.string()
    .required()
    .label("Data usage consent"),
  mentee_currentlyEnrolledInCourse: Yup.string().when("formType", {
    is: "public-sign-up-mentee-pending-review",
    then: Yup.string()
      .oneOf(courses.map(level => level.id))
      .label("Currently enrolled in course"),
  }),
});

export type SignUpFormType =
  | "public-sign-up-mentor-pending-review"
  | "public-sign-up-mentee-pending-review";

export interface SignUpFormValues {
  formType: SignUpFormType;
  gaveGdprConsentAt: string;
  username: string;
  password: string;
  passwordConfirm: string;
  firstName: string;
  lastName: string;
  agreesWithCodeOfConduct: boolean;
  mentee_currentlyEnrolledInCourse: string;
}

const initialValues: SignUpFormValues = {
  formType: "public-sign-up-mentee-pending-review",
  gaveGdprConsentAt: "",
  username: "",
  password: "",
  passwordConfirm: "",
  firstName: "",
  lastName: "",
  agreesWithCodeOfConduct: false,
  mentee_currentlyEnrolledInCourse: "",
};

export const buildSignUpForm = (
  type: SignUpFormType
): Function => (): React.ReactFragment => {
  const [submitError, setSubmitError] = useState(false);
  const submitForm = async (
    values: FormikValues,
    actions: FormikActions<SignUpFormValues>
  ) => {
    setSubmitError(false);
    const profile = values as Partial<RedProfile>;
    // TODO: this needs to be done in a smarter way, like iterating over the RedProfile definition or something
    const cleanProfile: Partial<RedProfile> = omit(profile, [
      "password",
      "passwordConfirm",
      "formType",
      "agreesWithCodeOfConduct",
    ]);
    cleanProfile.userType = type;
    cleanProfile.userActivated = false;
    cleanProfile.signupSource = "public-sign-up";
    try {
      await signUp(values.username, values.password, cleanProfile);
      history.push("/front/signup/complete/" + type);
    } catch (error) {
      setSubmitError(Boolean(error));
    }
    actions.setSubmitting(false);
  };

  initialValues.formType = type;

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema,
    onSubmit: submitForm,
  });

  const onChange = (name: any, e: any) => {
    e.persist();
    formik.handleChange(e);
    formik.setFieldTouched(name, true, false);
  };

  const determineInputColor = (field: keyof SignUpFormValues) =>
    formik.touched[field] && Boolean(formik.errors[field]) ? "danger" : null;

  return (
    <Columns vCentered>
      <Columns.Column
        size={6}
        responsive={{ mobile: { hide: { value: true } } }}
      >
        <Teaser.SignIn />
      </Columns.Column>

      <Columns.Column size={5} offset={1}>
        <form onSubmit={e => e.preventDefault()}>
          <Heading
            size={1}
            weight="normal"
            renderAs="h1"
            className="title--border"
          >
            Sign-up
          </Heading>

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
          {type === "public-sign-up-mentee-pending-review" && (
            <>
              <Form.Field>
                <Form.Label size="small">
                  Which course are you taking at ReDI?*
                </Form.Label>
                <Form.Control>
                  <Form.Select
                    name="mentee_currentlyEnrolledInCourse"
                    className="is-fullwidth"
                    value={formik.values.mentee_currentlyEnrolledInCourse}
                    onChange={onChange.bind(
                      null,
                      "mentee_currentlyEnrolledInCourse"
                    )}
                    color={determineInputColor(
                      "mentee_currentlyEnrolledInCourse"
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
          <Form.Field className="submit-spacer">
            <Form.Control>
              <input
                id="agreesWithCodeOfConduct"
                className="is-checkradio is-small"
                type="checkbox"
                name="agreesWithCodeOfConduct"
                checked={formik.values.agreesWithCodeOfConduct}
                onChange={onChange.bind(null, "agreesWithCodeOfConduct")}
                disabled={formik.isSubmitting}
              />
              <label htmlFor="agreesWithCodeOfConduct">
                I agree to the{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://connect.redi-school.org/downloadeables/redi-connect-code-of-conduct.pdf"
                >
                  Code of Conduct
                </a>{" "}
                of the ReDI School
              </label>
            </Form.Control>
          </Form.Field>

          <Form.Field>
            <Form.Control>
              <input
                id="gaveGdprConsentAt"
                type="checkbox"
                className="is-checkradio is-small is-checkradio--redi"
                name="gaveGdprConsentAt"
                value={new Date().toString()}
                checked={!!formik.values.gaveGdprConsentAt.length}
                onChange={onChange.bind(null, "gaveGdprConsentAt")}
                disabled={formik.isSubmitting}
              />
              <label htmlFor="gaveGdprConsentAt">
                I give permission to the ReDI School Terms stated in the{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.redi-school.org/data-privacy-policy"
                >
                  Data Protection
                </a>
              </label>
            </Form.Control>
            {submitError && (
              <Form.Help color="danger">
                An error occurred, please try again.
              </Form.Help>
            )}
          </Form.Field>
          <Form.Field>
            <Form.Control>
              <Button
                className="button--default button--medium"
                fullwidth={true}
                onClick={() => formik.handleSubmit()}
                disabled={formik.dirty && formik.isValid ? false : true}
              >
                Submit
              </Button>
            </Form.Control>
          </Form.Field>
        </form>
      </Columns.Column>
    </Columns>
  );
};