(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * shows planned velocity for timebox
     */
    Ext.define('Rally.apps.iterationtrackingboard.statsbanner.PlannedVelocity', {
        extend: 'Rally.apps.iterationtrackingboard.statsbanner.Gauge',
        alias:'widget.statsbannerplannedvelocity',
        require: ['Rally.util.Colors'],

        tpl: [
            '<div class="expanded-widget">',
            '<div class="stat-title">Completed Features</div>',
            '<div class="stat-metric">',
            '<div class="metric-chart"></div>',
            '<div class="metric-chart-text percent-offset">',
            '{percentage}<div class="metric-percent">%</div>',
            '</div>',
            '<div class="metric-subtext">{estimate} of {plannedVelocity} {unit}</div>',
            '</div>',
            '</div>',
            '<div class="collapsed-widget">',
            '<div class="stat-title">Completed Features</div>',
            '<div class="stat-metric">{percentage}<span class="metric-percent">%</span></div>',
            '</div>'
        ],

        config: {
            data: {
                percentage: 0,
                estimate: 0,
                plannedVelocity: 0,
                unit: ''
            }
        },

        onDataChanged: function() {
            console.log("Inside onDataChanged");
            this._getRenderData().then({
                success: function(renderData){
                    this.update(renderData);
                    this.refreshChart(this._getChartConfig(renderData));
                },
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

        _getRenderData: function() {
            var deferred = Ext.create('Deft.Deferred');
            var allFeatures = _.filter(this.store.getRange(), function(record) {
                return record.get("_type") == "portfolioitem/feature";
            } );            
            console.log("All features: ", allFeatures);
            var done = 0; 
            for (var index = 0; index < allFeatures.length; index++) {
                var state = allFeatures[index].get("State");
                if (state && state._refObjectName == "Done") {
                    done++;
                }
            }
            
            console.log("Done Feature: ", done);
            
            if ( isNaN(done) ) {
                done = 0;
            }
            
             var data = {
                    estimate: done,
                    percentage: Math.round((done/allFeatures.length) * 100),
                    plannedVelocity: allFeatures.length,
                    unit: ''
                };
            deferred.resolve(data);

            return deferred.promise;
        },

        _getChartConfig: function(renderData) {
            var percentage = renderData.percentage,
                percentagePlanned = percentage % 100 || 100,
                color = Rally.util.Colors.cyan_med,
                secondaryColor = Rally.util.Colors.grey1;

            if (percentage > 100) {
                color = Rally.util.Colors.blue;
                secondaryColor = Rally.util.Colors.cyan;
            } else if (percentage > 70) {
                color = Rally.util.Colors.cyan;
            } else if (percentage === 0) {
                color = Rally.util.Colors.grey1;
            }

            return {
                chartData: {
                    series: [{
                        data: [
                            {
                                name: 'Planned Estimate Total',
                                y: percentagePlanned,
                                color: color
                            },
                            {
                                name: '',
                                y: 100 - percentagePlanned,
                                color: secondaryColor
                            }
                        ]
                    }]
                }
            };
        }
    });
})();