var express = require('express'),
    approvals = express.Router();

module.exports = function(models, config, utils) {
  // var User = models.User;
  var Approval = models.Approval;
  

  var retrieveAll = function(req,res) {
    return res.json({
      error : "there's no reason you should need to see ALL approvals"
    })
  };

  var updateApproval = function(req, res) {
    var a = req.body;
    if (!a.status || (a.status != 'APPROVED' && a.status != 'DECLINED')) {
      return res.status(400).json({
        error: 'Invalid new status value'
      });
    }
    Approval
      .findById(req.params.id)
      .then(function(approval) {
        if (!approval) {
          return res.status(400).json({
            error : "Approval not found."
          });
        }
        approval.update({
          status: a.status
        })
        .then(function(approval) {
          return res.json(200, {
            approval: approval.toJSON()
          });
        })
        .catch(function(err) {
          console.log("here2");
          return res.status(400).json({
            error : err
          });
        });  
      })
      .catch(function(err) {
        console.log("here3");
        return res.status(400).json({
          error : JSON.stringify(err)
        });
      });
  };

  approvals.get('/', retrieveAll);
  
  approvals.put('/:id', updateApproval);

  return approvals;
};