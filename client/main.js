/* eslint-env meteor */

Template.body.helpers({
  feedUrl() {
    return Meteor.absoluteUrl('rss/latest');
  },
});
