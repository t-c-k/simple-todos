import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Tasks } from '../api/tasks.js';

import './task.html';

Template.task.helpers({
  isOwner() {
    return this.owner === Meteor.userId();
  },
  dueAtFormatted() {
    // debugger;
    return moment(this.dueAt).format('MMMM Do YYYY');
  }
});

Template.task.events({
  'click .delete'() {
    Meteor.call('tasks.remove', this._id);
  },
  'change .toggle-private'(event) {
    const isPrivate = event.target.checked;

    Meteor.call('tasks.setPrivate', this._id, isPrivate);
  },
});
