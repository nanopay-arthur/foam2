/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'Renewable',

  sections: [
    {
      name: 'ucjExpirySection',
      isAvailable: function(isRenewable) { return isRenewable; }
    }
  ],

  properties: [
    {
      name: 'isExpired',
      class: 'Boolean',
      section: 'ucjExpirySection',
      javaSetter: `
        isExpired_ = val;
        isExpiredIsSet_ = true;
        if ( isExpired_ ) {
          isInGracePeriod_ = false;
        }
      `
    },
    {
      name: 'isRenewable',
      class: 'Boolean',
      section: 'ucjExpirySection',
      javaGetter: `
        return getIsExpired() || getIsInRenewablePeriod() || getIsInGracePeriod();
      `
    },
    {
      name: 'isInRenewablePeriod',
      class: 'Boolean',
      section: 'ucjExpirySection',
      javaSetter: `
        isInRenewablePeriod_ = val;
        isInRenewablePeriodIsSet_ = true;
        if ( isInRenewablePeriod_ ) {
          isExpired_ = false;
          isInGracePeriod_ = false;
          isRenewable_ = true;
        }
      `
    },
    {
      name: 'isInGracePeriod',
      class: 'Boolean',
      section: 'ucjExpirySection',
      javaSetter: `
        isInGracePeriod_ = val;
        isInGracePeriodIsSet_ = true;
        if ( isInGracePeriod_ ) {
          isExpired_ = false;
          isInRenewablePeriod_ = false;
          isRenewable_ = true;
        }
      `
    },
    {
      name: 'expiry',
      class: 'DateTime',
      section: 'ucjExpirySection',
      documentation: `
        The date of expiry for this ucj. After this date, the ucj will stay GRANTED
        for a gracePeriod, or go into EXPIRED status, if no gracePeriod is set.
      `
    },
    {
      name: 'gracePeriod',
      class: 'Int',
      section: 'ucjExpirySection',
      documentation: `
        Number of days left that a user can use the Capability in this ucj after it has expired
      `
    }
  ],

  methods: [
    {
      name: 'getRenewalStatusChanged',
      args: [
        { name: 'old', javaType: 'foam.nanos.crunch.UserCapabilityJunction' }
      ],
      type: 'Boolean',
      javaCode: `
        if ( old.getIsExpired() != getIsExpired() ) return true;
        if ( old.getIsRenewable() != getIsRenewable() ) return true;
        if ( old.getIsInRenewablePeriod() != getIsInRenewablePeriod() ) return true;
        if ( old.getIsInGracePeriod() != getIsInGracePeriod() ) return true;

        return false;
      `
    },
    {
      name: 'updateDependentRenewalStatus',
      args: [
        { name: 'dependent', javaType: 'foam.nanos.crunch.UserCapabilityJunction' }
      ],
      javaType: 'foam.nanos.crunch.UserCapabilityJunction',
      javaCode: `
        if ( getIsExpired() ) dependent.setIsExpired(true);
        if ( getIsInRenewablePeriod() ) dependent.setIsInRenewablePeriod(true);
        if ( getIsInGracePeriod() ) dependent.setIsInGracePeriod(true);
        if ( getIsRenewable() ) dependent.setIsRenewable(true);

        return dependent;
      `
    }
  ]
});
