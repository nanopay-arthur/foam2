/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailServiceDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.EmailService'
  ],

  imports: [
    'email?'
  ],

  properties: [
    {
      name: 'emailService',
      documentation: `This property determines how to process the email.`,
      of: 'foam.nanos.notification.email.EmailService',
      class: 'FObjectProperty',
      javaFactory: `
      return (EmailService)getEmail();
      `
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode:
      `
        getEmailService().sendEmail(x, (EmailMessage)obj);
        return getDelegate().inX(x).put(obj);
      `
    }
  ]
});
