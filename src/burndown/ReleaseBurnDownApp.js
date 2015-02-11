(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.charts.burndown.ReleaseBurnDownApp', {
        extend: 'Rally.apps.charts.burndown.BurnDownApp',
        integrationHeaders : {
            name: 'Release Burndown'
        }
    });
}());
