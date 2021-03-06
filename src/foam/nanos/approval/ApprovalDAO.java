/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.approval;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.sink.Sum;
import foam.nanos.auth.User;
import foam.nanos.ruler.Operations;
import foam.nanos.approval.ApprovalStatus;
import foam.nanos.approval.ApprovalRequest;

import static foam.mlang.MLang.*;

/**
 * When a single request is approved, checks all other approved requests and calculates points.
 * If points are sufficient ( >= requiredPoints ), removes all unused requests from approvalRequestDAO and
 * Re-submits the object to its dao (daoKey), where a rule should be defined to determine further actions.
 */
public class ApprovalDAO
  extends ProxyDAO {

  public ApprovalDAO(X x,DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    DAO requestDAO = ((DAO)x.get("approvalRequestDAO"));
    ApprovalRequest old = (ApprovalRequest) requestDAO.find(obj);
    ApprovalRequest request = (ApprovalRequest) getDelegate().put(obj);

    if ( old != null && old.getStatus() != request.getStatus()
      || old == null && request.getStatus() != ApprovalStatus.REQUESTED
    ) {
      DAO requests = ApprovalRequestUtil.getAllRequests(x, request.getObjId(), request.getClassification());
      // if points are sufficient to consider object approved
      if ( getCurrentPoints(requests) >= request.getRequiredPoints() ||
           getCurrentRejectedPoints(requests) >= request.getRequiredRejectedPoints() ) {

        //removes all the requests that were not approved to clean up approvalRequestDAO
        removeUnusedRequests(requests);

        if ( 
          request.getStatus() == ApprovalStatus.APPROVED ||
          ( 
            request.getStatus() == ApprovalStatus.REJECTED && ((ApprovalRequest) request).getOperation() == Operations.CREATE 
          )
        ){
          //puts object to its original dao
          try {
            rePutObject(x, request);
          } catch ( Exception e ) {
            request.setStatus(ApprovalStatus.REQUESTED);
            getDelegate().put(request);
            throw new RuntimeException(e);
          }
        }
      }
    }
    return request;
  }

  private void rePutObject(X x, ApprovalRequest request) {
    DAO dao = (DAO) x.get(request.getDaoKey());
    FObject found = dao.inX(x).find(request.getObjId()).fclone();

    if ( request instanceof ApprovalRequest ) {
      DAO userDAO = (DAO) x.get("localUserDAO");
      User initiatingUser = (User) userDAO.find(((ApprovalRequest) request).getCreatedBy());
      X initiatingUserX = x.put("user", initiatingUser);

      if ( ((ApprovalRequest) request).getOperation() == Operations.REMOVE ) {
        dao.inX(initiatingUserX).remove(found);
      } else {
        dao.inX(initiatingUserX).put(found);
      }
    } else {
      dao.inX(x).put(found);
    }
  }

  private void removeUnusedRequests(DAO dao) {
    dao.where(EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED)).removeAll();
  }

  private long getCurrentPoints(DAO dao) {
    return ((Double)
      ((Sum) dao
        .where(EQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED))
        .select(SUM(ApprovalRequest.POINTS))
      ).getValue()
    ).longValue();
  }

  private long getCurrentRejectedPoints(DAO dao) {
    return ((Double)
      ((Sum) dao
        .where(EQ(ApprovalRequest.STATUS, ApprovalStatus.REJECTED))
        .select(SUM(ApprovalRequest.POINTS))
      ).getValue()
    ).longValue();
  }
}
