"use strict"

var algo = algo || {};

algo.TutorialApp = function () {

    // sink create new tutorial button

    $('[data-element="new-tutorial"]').click(_.bind(function(){

        algo.App.I.okCancel("Create Tutorial", "Create New Tutorial?", "Create", _.bind(function (result) {

            if (result) {

                algo.Tutorial.create(_.bind(function(error, tutorial) {

                    if (error) {

                        algo.App.I.message("Error", "<p>There was a problem creating the tutorial.</p><b>Error:</b>" + K.errorToString(error));

                    } else {

                        // nav to editor page for the new tutorial

                        algo.App.I.goto(_.sprintf("/admin/tutorialeditor?id=%s", tutorial.id));
                    }

                }, this));
            }
        }, this));


    }, this));

    // sink clicks on admin only delete tutorial links

    $('a[data-tutorial]').click(_.bind(function(e) {

        // tutorial id from link

        var id = $(e.target).attr('data-tutorial');

        algo.App.I.okCancel("Delete Tutorial", "Are you sure you want to delete this tutorial?", "Delete", _.bind(function (result) {

            if (result) {

                algo.Tutorial.delete(id, _.bind(function(error) {

                    if (error) {

                        algo.App.I.message("Error", "<p>There was a problem deleting the tutorial.</p><b>Error:</b>" + K.errorToString(error));

                    } else {

                        // success, remove tutorial tile from page

                        $(_.sprintf('div.tutorial-tile[data-tutorial="%s"]', id)).remove();
                    }


                }, this));
            }
        }, this));

        e.preventDefault();
        return false;

    }, this));

};

