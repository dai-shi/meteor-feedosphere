// rss 2.0 generation code

/* global RssFeed, Versions */

RssFeed.publish('latest', function() {
  var self = this;

  self.setValue('title', self.cdata('Meteor Latest Packages'));
  self.setValue('description', self.cdata('This is a feed for latest 20 meteor packages published'));
  self.setValue('link', Meteor.absoluteUrl('rss/latest'));
  self.setValue('pubDate', new Date());
  self.setValue('ttl', 1);

  Versions.find({}, {
    limit: 20,
    sort: {
      published: -1
    }
  }).forEach(function(doc) {
    self.addItem({
      title: doc.packageName + ' ' + doc.version,
      description: doc.description,
      link: 'https://atmospherejs.com/' + doc.packageName.replace(/:/, '/'),
      pubDate: doc.published
    });
  });
});
