import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Tasks } from '../api/tasks.js';

import './task.js';
import './body.html';

Template.body.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe('tasks');
});

Template.body.helpers({
  tasks() {
    const instance = Template.instance(),
          sort = { dueAt: 1, createdAt: -1 };

    if (instance.state.get('hideCompleted')) {
      return Tasks.find({ checked: { $ne: true } }, { sort });
    }

    return Tasks.find({}, { sort });
  },
  incompleteCount() {
    return Tasks.find({ checked: { $ne: true } }).count();
  }
});

Template.body.events({
  'submit .new-task'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from form element
    const target = event.target,
          text   = target.text.value,
          dueAt    = target.due.value;

    // Don't add task if text is empty
    if (!text) { return; }

    // Insert a task into the collection
    Meteor.call('tasks.insert', { text, dueAt });

    // Clear form
    target.text.value = '';
    target.due.value  = '';
  },
  'change .hide-completed input'(event, instance) {
    instance.state.set('hideCompleted', event.target.checked);
  }
});
