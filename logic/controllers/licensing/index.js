const licenseDB = require("../../config/model/licensedb");
const licensingClientDB = require("../../config/model/licensingClient");
const crypto = require('crypto');

const pendingActivities = async (req, res) => {
  try {
    const userId = req.user.id;

    const userDetails = await licensingClientDB.findOne({
      where: { id: userId }
    });

    if (!userDetails) {
      return res.status(404).json({
        StatusCode: 404,
        Message: "failed",
        Data: { Message: "User not found" }
      });
    }

    const user = userDetails.email;
    const licenseDBUserDetails = await licenseDB.findOne({
      where: { email: user }
    });

   if (!licenseDBUserDetails) {
      return res.status(404).json({
        StatusCode: 404,
        Message: "failed",
        Data: { Message: "User not found" }
      });
    }

    const pendingCount = (licenseDBUserDetails.licensingLogs || [])
    .filter(log => log.status === "pending")
    .length;


    return res.json({
      StatusCode: 200,
      Message: "success",
      data: pendingCount
    });

  } catch (err) {
    console.error("getUserNodes error:", err);

    return res.status(500).json({
      StatusCode: 500,
      message: "Failed to fetch user nodes",
    });
  }
};

const reccuringSubCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const userDetails = await licensingClientDB.findOne({
      where: { id: userId }
    });

    if (!userDetails) {
      return res.status(404).json({
        StatusCode: 404,
        Message: "failed",
        Data: { Message: "User not found" }
      });
    }

    const user = userDetails.email;
    const licenseDBUserDetails = await licenseDB.findOne({
      where: { email: user }
    });

   if (!licenseDBUserDetails) {
      return res.status(404).json({
        StatusCode: 404,
        Message: "failed",
        Data: { Message: "User not found" }
      });
    };

    const reccuringSubCount = (licenseDBUserDetails.serviceSub || []).length;


    return res.json({
      StatusCode: 200,
      Message: "success",
      data: reccuringSubCount
    });

  } catch (err) {
    console.error("getUserNodes error:", err);

    return res.status(500).json({
      StatusCode: 500,
      message: "Failed to fetch user nodes",
    });
  }
};

// const walletDeposit = async (req, res) => {
  
//   try {

//     const userId = req.user.id;
//     const _amount = req.body.AMOUNT;

//     if(!_amount){
//         return res.status(404).json({
//             StatusCode: 404,
//             Message: "failed",
//             Data: "requird amount input data missing"
//         });
//     };

//     const userDetails = await licensingClientDB.findOne({
//       where: { id: userId }
//     });

//     if (!userDetails) {
//       return res.status(404).json({
//         StatusCode: 404,
//         Message: "failed",
//         Data: { Message: "User not found" }
//       });
//     }

//     const user = userDetails.email;
//     const licenseDBUserDetails = await licenseDB.findOne({
//       where: { email: user }
//     });

//    if (!licenseDBUserDetails) {
//       return res.status(404).json({
//         StatusCode: 404,
//         Message: "failed",
//         Data: { Message: "User not found" }
//       });
//     };

//     // let wbalance = licenseDBUserDetails.walletBalance;
//     licenseDBUserDetails.walletBalance += _amount;
//     // wbalance += _amount;
//     // licenseDBUserDetails.walletBalance = wbalance;
//     await licenseDBUserDetails.save();

//     return res.json({
//       StatusCode: 200,
//       Message: "success",
//       data: "wallet balance updated"
//     });

//   } catch (err) {
//     console.error("wallet balance error:", err);

//     return res.status(500).json({
//       StatusCode: 500,
//       message: "Failed to update wallet balance",
//     });
//   }
// };

const addWalletTxn = async (req, res) => {
  
  try {

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: "UNAUTHORIZED"
      });
    };

    const userId = req.user.id;
    const _kind = req.body.KIND;
    const _amount = req.body.AMOUNT;
    const _description = req.body.DESCRIPTION;

    if (_amount <= 0) {
      return res.status(400).json({
        error: "INVALID_AMOUNT"
      });
    };

    console.log("kind: ", _kind);

    if (!_kind || !_amount || !_description) {
      return res.status(400).json({
        StatusCode: 400,
        Message: "failed",
        Data: "Please input all required details"
      });
    }

    if (_kind === "deposit"){

      const data = {
        id: crypto.randomUUID(),
        kind: _kind,
        amount: _amount,
        description: _description,
        createdAt: new Date().toISOString()
      }

      const userDetails = await licensingClientDB.findOne({
        where: { id: userId }
      });

      if (!userDetails) {
        return res.status(404).json({
          StatusCode: 404,
          Message: "failed",
          Data: { Message: "User not found" }
        });
      }

      const user = userDetails.email;
      const licenseDBUserDetails = await licenseDB.findOne({
        where: { email: user }
      });

    if (!licenseDBUserDetails) {
      return res.status(404).json({
        StatusCode: 404,
        Message: "failed",
        Data: { Message: "User not found" }
      });
    }

    const logs = Array.isArray(licenseDBUserDetails.walletTrxLogs)
      ? licenseDBUserDetails.walletTrxLogs
      : [];

    licenseDBUserDetails.walletTrxLogs = [...logs, data];
    licenseDBUserDetails.changed('walletTrxLogs', true);
    licenseDBUserDetails.walletBalance += _amount;

    await licenseDBUserDetails.save();
    // console.log("licenseDBUserDetails: ", licenseDBUserDetails);

    return res.json({
      StatusCode: 200,
      Message: "success",
    });
      
    } else if (_kind === "charge") {

      const data = {
          id: crypto.randomUUID(),
          kind: _kind,
          amount: _amount,
          description: _description,
          createdAt: new Date().toISOString()
      }

      const userDetails = await licensingClientDB.findOne({
        where: { id: userId }
      });

      if (!userDetails) {
        return res.status(404).json({
          StatusCode: 404,
          Message: "failed",
          Data: { Message: "User not found" }
        });
      }

      const user = userDetails.email;
      const licenseDBUserDetails = await licenseDB.findOne({
        where: { email: user }
      });

     if (!licenseDBUserDetails) {
      return res.status(404).json({
        StatusCode: 404,
        Message: "failed",
        Data: { Message: "User not found" }
      });
    }

    const logs = Array.isArray(licenseDBUserDetails.walletTrxLogs)
      ? licenseDBUserDetails.walletTrxLogs
      : [];

    licenseDBUserDetails.walletTrxLogs = [...logs, data];
    licenseDBUserDetails.changed('walletTrxLogs', true);
    licenseDBUserDetails.walletBalance -= _amount;

    await licenseDBUserDetails.save();

    return res.json({
      StatusCode: 200,
      Message: "success",
    });
    };

  } catch (err) {
    console.error("getUserNodes error:", err);

    return res.status(500).json({
      StatusCode: 500,
      message: "Failed to fetch user details",
    });
  }
};

const addActivity = async (req, res) => {
  try {
    console.log("REQ.USER:", req.user);
    console.log("BODY:", req.body);

    const userId = req.user.id;

    const userDetails = await licensingClientDB.findOne({
      where: { id: userId }
    });

    console.log("USER DETAILS:", userDetails?.email);

    const licenseDBUserDetails = await licenseDB.findOne({
      where: { email: userDetails.email }
    });

    console.log("BEFORE:", licenseDBUserDetails.licensingLogs);

    const newLog = {
      id: crypto.randomUUID(),
      type: req.body.TYPE,
      service: req.body.SERVICE,
      serviceLabel: req.body.SERVICE_LABEL,
      title: req.body.TITLE,
      details: req.body.DETAILS,
      status: "pending",
      fee: req.body.FEE,
      createdAt: new Date().toISOString()
    };

    const logs = licenseDBUserDetails.licensingLogs || [];

    licenseDBUserDetails.licensingLogs = [...logs, newLog];

    licenseDBUserDetails.changed("licensingLogs", true);

    await licenseDBUserDetails.save();

    await licenseDBUserDetails.reload();

    console.log("AFTER SAVE:", licenseDBUserDetails.licensingLogs);

    return res.json({
      StatusCode: 200
    });

  } catch (err) {
    console.error("ADD ACTIVITY ERROR:", err);
    return res.status(500).json(err.message);
  }
};

const getUserData = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(404).json({
        StatusCode: 404,
        Message: "failed",
        Data: "User ID missing"
      });
    }

    const userDetails = await licensingClientDB.findOne({
      where: { id: userId }
    });

    if (!userDetails) {
      return res.status(404).json({
        StatusCode: 404,
        Message: "failed",
        Data: { Message: "User not found" }
      });
    }

    const licenseDBUserDetails = await licenseDB.findOne({
      where: { email: userDetails.email }
    });

    if (!licenseDBUserDetails) {
      return res.status(404).json({
        StatusCode: 404,
        Message: "failed",
        Data: { Message: "User not found in license DB" }
      });
    }

    return res.json({
      StatusCode: 200,
      Message: "success",
      userData: {
        id: userDetails.id,
        email: userDetails.email,
        phoneNumber: userDetails.phoneNumber,
        fullName: userDetails.fullName,
        accessToken: req.headers.authorization?.split(" ")[1],
        licensingData: licenseDBUserDetails
      }
    });

  } catch (err) {
    console.error("getUserData error:", err);
    return res.status(500).json({
      StatusCode: 500,
      message: "Failed to fetch user data",
    });
  }
};

module.exports = { 
    pendingActivities,
    reccuringSubCount,
    addWalletTxn,
    // walletDeposit,
    addActivity,
    getUserData
 };