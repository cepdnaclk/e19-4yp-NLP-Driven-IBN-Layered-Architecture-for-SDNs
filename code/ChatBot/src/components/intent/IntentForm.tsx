import React from 'react';
import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from 'formik';
import { intentSchema } from '../../schemas/intentSchema';

interface IntentFormProps {
  initialValues: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

const IntentForm: React.FC<IntentFormProps> = ({ initialValues, onSubmit, onCancel }) => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={intentSchema}
      onSubmit={(values, { setSubmitting }: FormikHelpers<any>) => {
        onSubmit(values);
        setSubmitting(false);
      }}
    >
      {({ isSubmitting, isValid, dirty }) => (
        <Form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div className="col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <Field
                id="name"
                name="name"
                type="text"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
              <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Description Field */}
            <div className="col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <Field
                as="textarea"
                id="description"
                name="description"
                rows={3}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
              <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Source Field */}
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source
              </label>
              <Field
                id="source"
                name="source"
                type="text"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
              <ErrorMessage name="source" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Destination Field */}
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Destination
              </label>
              <Field
                id="destination"
                name="destination"
                type="text"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
              <ErrorMessage name="destination" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Protocol Field */}
            <div>
              <label htmlFor="protocol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Protocol
              </label>
              <Field
                as="select"
                id="protocol"
                name="protocol"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select Protocol</option>
                <option value="TCP">TCP</option>
                <option value="UDP">UDP</option>
                <option value="ICMP">ICMP</option>
              </Field>
              <ErrorMessage name="protocol" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Port Field */}
            <div>
              <label htmlFor="port" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Port
              </label>
              <Field
                id="port"
                name="port"
                type="number"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
              <ErrorMessage name="port" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* QoS Section */}
            <div className="col-span-2">
              <h3 className="text-md font-medium text-gray-800 dark:text-white mb-3">Quality of Service</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                {/* Bandwidth Field */}
                <div>
                  <label htmlFor="qos.bandwidth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bandwidth
                  </label>
                  <Field
                    id="qos.bandwidth"
                    name="qos.bandwidth"
                    type="text"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                  <ErrorMessage name="qos.bandwidth" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
                </div>

                {/* Latency Field */}
                <div>
                  <label htmlFor="qos.latency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Latency
                  </label>
                  <Field
                    id="qos.latency"
                    name="qos.latency"
                    type="text"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                  <ErrorMessage name="qos.latency" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
                </div>

                {/* Priority Field */}
                <div>
                  <label htmlFor="qos.priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <Field
                    as="select"
                    id="qos.priority"
                    name="qos.priority"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Select Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Field>
                  <ErrorMessage name="qos.priority" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="col-span-2">
              <h3 className="text-md font-medium text-gray-800 dark:text-white mb-3">Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                {/* Encryption Field */}
                <div>
                  <label htmlFor="security.encryption" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Encryption
                  </label>
                  <Field
                    as="select"
                    id="security.encryption"
                    name="security.encryption"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Select Encryption</option>
                    <option value="none">None</option>
                    <option value="AES-128">AES-128</option>
                    <option value="AES-256">AES-256</option>
                  </Field>
                  <ErrorMessage name="security.encryption" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
                </div>

                {/* Authentication Field */}
                <div>
                  <label htmlFor="security.authentication" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Authentication
                  </label>
                  <Field
                    as="select"
                    id="security.authentication"
                    name="security.authentication"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Select Authentication</option>
                    <option value="none">None</option>
                    <option value="required">Required</option>
                  </Field>
                  <ErrorMessage name="security.authentication" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isValid || !dirty}
              className={`px-4 py-2 rounded-md ${
                isSubmitting || !isValid || !dirty
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default IntentForm;
