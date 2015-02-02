(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * shows accepted work units for timebox
     */
    Ext.define('Rally.apps.iterationtrackingboard.statsbanner.Accepted', {
        extend: 'Rally.apps.iterationtrackingboard.statsbanner.Gauge',
        alias:'widget.statsbanneraccepted',
        requires: ['Rally.util.Colors'],

        tpl: [
            '<div class="expanded-widget">',
            '<div class="stat-title">Accepted</div>',
            '<div class="stat-metric">',
            '<div class="metric-chart"></div>',
            '<div class="metric-chart-text percent-offset">',
            '{percentage}<div class="metric-percent">%</div>',
            '</div>',
            '<div class="metric-subtext">{accepted} of {total} {unit}</div>',
            '</div>',
            '</div>',
            '<div class="collapsed-widget">',
            '<div class="stat-title">Accepted</div>',
            '<div class="stat-metric">{percentage}<span class="metric-percent">%</span></div>',
            '</div>'
        ],

        config: {
            data: {
                percentage: 0,
                accepted: 0,
                total: 0,
                unit: ''
            }
        },

        onDataChanged: function () {
            this.getTimeboxData().then({
                success: this._onDataAssembled,
                scope: this
            });
        },

        getChartEl: function() {
            return this.getEl().down('.metric-chart');
        },

        _getTimeboxUnits: function() {
            return this.getContext().getTimeboxScope().getType() === 'iteration' ?
                    this.getContext().getWorkspace().WorkspaceConfiguration.IterationEstimateUnitName :
                    this.getContext().getWorkspace().WorkspaceConfiguration.ReleaseEstimateUnitName;
        },

        _getRenderData: function(timeboxData) {
            var data = _.merge(
                {unit: this._getTimeboxUnits()},
                this.getAcceptanceData(),
                timeboxData
            );

            data.accepted = Ext.util.Format.round(data.accepted, 2);
            data.total = Ext.util.Format.round(data.total, 2);
            data.percentage = Math.round((data.accepted / data.total) * 100) || 0;

            return data;
        },

        _onDataAssembled: function (timeboxData) {
            var renderData = this._getRenderData(timeboxData);
            this.update(renderData);

            this.refreshChart(this._getChartConfig(renderData));
        },

        _getChartConfig: function(renderData) {
            var color = Rally.util.Colors.cyan,
                daysRemaining = renderData.remaining / renderData.workdays,
                percentage = renderData.percentage;

            if (percentage === 100) {
                color = Rally.util.Colors.lime;
            } else if (daysRemaining === 0) {
                color = Rally.util.Colors.blue;
            }

            return {
                chartData: {
                    series: [{
                        data: [
                            {
                                name: 'Accepted',
                                y: percentage,
                                color: color
                            },
                            {
                                name: '',
                                y: 100 - percentage,
                                color: Rally.util.Colors.grey1
                            }
                        ]
                    }]
                }
            };
        }
    });
})();