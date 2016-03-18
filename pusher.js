var apn = require('apn');

var apnConnection = new apn.Connection({});

var myDevice = new apn.Device("481b4bbef1f5be965e9f131ffdbdda8e859ad0db2a1a38ad34d00c454ac4588c");

var note = new apn.Notification();

note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
note.badge = 3;
note.sound = "ping.aiff";
note.alert = "\uD83D\uDCE7 \u2709 You have a pending approval.";
note.payload = {'messageFrom': 'Kevin'};

apnConnection.pushNotification(note, myDevice);
