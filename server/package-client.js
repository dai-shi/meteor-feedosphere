// client code for Meteor Package Server API
// https://github.com/meteor/meteor/wiki/Meteor-Package-Server-API
// https://github.com/meteor/meteor/tree/devel/tools/packaging

/* global Configs:true, Versions:true */
/* eslint no-console:false */

Configs = new Mongo.Collection('Configs');
Versions = new Mongo.Collection('Versions');

const conn = DDP.connect('http://packages.meteor.com/');

let syncToken = Configs.findOne('syncToken');
if (syncToken) {
  syncToken = syncToken.data;
} else {
  // XXX wishing to use "defaults" collection
  syncToken = {
    format: '1.1'
  };
}

function getAllPackageData() {
  conn.call('syncNewPackageData', syncToken, function(err, result) {
    if (err) return console.log('failed to sync new package data', err);
    if (result.resetData) {
      Versions.remove({});
    }
    const versions = result.collections.versions;
    for (let item of versions || []) {
      let oldItem = Versions.findOne(item.packageName);
      if (!oldItem || oldItem.published < item.published) {
        delete item._id;
        delete item.dependencies;
        Versions.upsert(item.packageName, item);
      }
    }
    syncToken = result.syncToken;
    Configs.upsert('syncToken', {
      data: syncToken
    });
    if (!result.upToDate) {
      console.log('sync continuing...', syncToken);
      Meteor.setTimeout(getAllPackageData, 1000);
    } else {
      // XXX wishing to use "changes" collection
      console.log('sync again...', syncToken);
      Meteor.setTimeout(getAllPackageData, 60 * 1000);
    }
  });
}

getAllPackageData();
