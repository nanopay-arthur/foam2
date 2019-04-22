foam.CLASS({
  package: 'foam.demos.flow2',
  name: 'User',
  requires: [
    'foam.demos.flow2.Transaction'
  ],
  imports: [
    'flow2TransactionDAO as transactionDAO'
  ],
  properties: [
    {
      class: 'Int',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Currency',
      name: 'balance'
    },
    {
      class: 'String',
      name: 'denomination'
    },
    {
      class: 'Date',
      name: 'createdOn'
    },
    {
      class: 'String',
      name: 'createdBy'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'transactions',
      expression: function(id, transactionDAO) {
        var E = foam.mlang.ExpressionsSingleton.create();
        return transactionDAO.where(
          E.OR(
            E.EQ(this.Transaction.PAYEE, id),
            E.EQ(this.Transaction.PAYER, id)
          )
        );
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.demos.flow2',
  name: 'Transaction',
  properties: [
    {
      class: 'Int',
      name: 'id'
    },
    {
      class: 'Reference',
      of: 'foam.demos.flow2.User',
      name: 'payer'
    },
    {
      class: 'Reference',
      of: 'foam.demos.flow2.User',
      name: 'payee'
    },
    {
      class: 'Currency',
      name: 'amount'
    },
    {
      class: 'String',
      name: 'denomination'
    },
    {
      class: 'Date',
      name: 'createdOn'
    }
  ]
});

foam.CLASS({
  package: 'foam.demos.flow2',
  name: 'Flow2Demo',
  extends: 'foam.u2.Element',
  requires: [
    'foam.demos.flow2.User',
    'foam.demos.flow2.UserDetailView'
  ],
  methods: [
    function initE() {
      var obj = this.User.create();
      this.tag(
        this.UserDetailView,
        { data: obj });
    }
  ]
});