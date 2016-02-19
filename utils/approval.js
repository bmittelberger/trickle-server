module.exports = function(models, config) {
  
  
  var processApprovalUpdate = function(approval, cb) {
    console.log("sup1");
    cb();
  };
  
  return {
    processApprovalUpdate : processApprovalUpdate
  }
};