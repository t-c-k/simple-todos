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

function dueAtFilter() {
  const { start, end } = Template.instance().state.get('filterDate') || {},
        filter = {};

  if (start) { filter['$gte'] = start; }
  if (end) { filter['$lte'] = end; }

  return filter;
}

Template.body.helpers({
  tasksWithStatus(status) {
    const instance = Template.instance(),
          sort = { dueAt: 1, createdAt: -1 };

    const dueAt = dueAtFilter();

    if (instance.state.get('hideCompleted')) {
      return Tasks.find({ checked: { $ne: true }, status, dueAt }, { sort });
    }

    return Tasks.find({ status, dueAt }, { sort });
  },
  incompleteCount() {
    const dueAt = dueAtFilter();

    return Tasks.find({ status: { $ne: 'done' }, dueAt }).count();
  }
});

Template.body.events({
  'submit .new-task'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from form element
    const target = event.target,
          text   = target.text.value,
          dueAt  = new Date(target.due.value);

    // Insert a task into the collection
    Meteor.call('tasks.insert', { text, dueAt });

    // Clear form
    target.text.value = '';
    target.due.value  = '';
  },
  'change .hide-completed input'(event, instance) {
    instance.state.set('hideCompleted', event.target.checked);
  },
  'change .filter input'(event, instance) {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from form element
    const { name, value } = event.target,
          newValue        = value ? new Date(value) : undefined;

    const filter = Object.assign(
      {},
      instance.state.get('filterDate'),
      { [name]: newValue }
    );

    instance.state.set('filterDate', filter);
  }
});

Template.body.rendered = function() {
  this.$('.tasks').sortable({
    connectWith: '.tasks',
    receive: function(e, ui) {
      const element = ui.item.get(0),
            status  = this.getAttribute('status');

      Meteor.call('tasks.setStatus', Blaze.getData(element)._id, status);
    }
  });
};
