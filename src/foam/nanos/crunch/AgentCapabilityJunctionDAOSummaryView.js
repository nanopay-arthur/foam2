/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.nanos.crunch',
    name: 'AgentCapabilityJunctionDAOSummaryView',
    extends: 'foam.comics.v2.DAOSummaryView',
  
    properties: [
      {
        class: 'foam.u2.ViewSpecWithJava',
        name: 'viewView',
        factory: function() {
          return foam.nanos.crunch.ui.CapableView.create({ ucjObj: this.data, showTitle: true }, this);
        }
      }
    ],
  });