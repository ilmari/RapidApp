Ext.Updater.defaults.disableCaching = true;


// All-purpose override allowing eval code in config
Ext.override(Ext.BoxComponent, {
	initComponent: function() {
		var thisB = this;
		if (thisB.afterRender_eval) { this.on('afterrender', function() { eval(thisB.afterRender_eval); }) }
		var config = this;
		if (this.init_evalOverrides) {
			for ( var i in this.init_evalOverrides ) {
				config[i] = eval(this.init_evalOverrides[i]);
			}
			Ext.apply(this, Ext.apply(this.initialConfig, config));
		}
		Ext.BoxComponent.superclass.initComponent.apply(this, arguments);
	}
	//,afterRender: function() { 
		//this.superclass.afterRender.call(this);
	//	if (this.afterRender_eval) { eval(this.afterRender_eval); }
		
	//}
});


/*
Ext.ns('Ext.ux.AjaxRPCAction');
Ext.ux.AjaxRPCAction = function(url,params) {
	if (!params) { params = {}; }
	Ext.Ajax.request({
		disableCaching: true,
		url: url,
		params: params,
		success: function(response, opts) {
			if(response.responseText) { 
				var Result = Ext.util.JSON.decode(response.responseText);
			
			}
		},
		failure: function(response, opts) {
			alert('Ext.ux.FetchEval (' + url + ') AJAX request failed.' );
		}
	});
}
*/

Ext.ns('Ext.ux.FindNodebyId');
Ext.ux.FindNodebyId = function(node,id) {
	this.node = node;
	this.id = id;
	
	alert(this.node.id);
	if (this.node.id == this.id) { return this.node; }
	//if (this.node.isLeaf()) { return false; }

	if (this.node.childNodes) {
		for ( var i in this.node.childNodes ) {
			var child = this.node.childNodes[i];
			var checknode = Ext.ux.FindNodebyId(child,this.id);
			if (checknode) { return checknode; }
		}
	}
	return false;
}


Ext.ns('Ext.ux.FetchEval');
Ext.ux.FetchEval = function(url,params) {
	if (!params) { params = {}; }
	Ext.Ajax.request({
		disableCaching: true,
		url: url,
		params: params,
		success: function(response, opts) {
			if(response.responseText) { return eval(response.responseText); }
		},
		failure: function(response, opts) {
			alert('Ext.ux.FetchEval (' + url + ') AJAX request failed.' );
		}
	});
}



// ------- http://extjs.com/forum/showthread.php?p=97676#post97676
Ext.override(Ext.CompositeElementLite, {
    getTextWidth: function() {
        var i, e, els = this.elements, result = 0;
        for(i = 0; e = Ext.get(els[i]); i++) {
            result = Math.max(result, e.getTextWidth.apply(e, arguments));
        }
        return result;
    }
});
// -------


/* This is crap since 'anchor' exists 
Ext.override(Ext.form.FormPanel, {
	plugins: [new Ext.ux.form.FieldAutoExpand()]
});
*/

/*
Ext.override(Ext.BoxComponent, {
	initComponent: function() {
		
		var thisC = this;
		if (thisC.autoLoadJsonConf) {
			
		
			Ext.Ajax.request({
				disableCaching: true,
				url: thisC.autoLoadJsonConf['url'],
				params: thisC.autoLoadJsonConf['params'],
				success: function(response, opts) {
				
					alert(response.responseText);
				
					var imported_data = Ext.util.JSON.decode(response.responseText);
					//var imported_data = eval('(' + response.responseText + ')');
					Ext.apply(this, Ext.apply(this.initialConfig, imported_data));
				},
				failure: function(response, opts) {
					alert('AJAX autoLoadJsonConf FAILED!!!!!!');
				}
			});
		}
		Ext.BoxComponent.superclass.initComponent.apply(this, arguments);
	}
});



Ext.override(Ext.BoxComponent, {
	initComponent: function() {
		
		var thisC = this;
		
		if (Ext.isArray(this.items)) {
			for (i in this.items) {
				if(this.items[i]['autoLoadJsonConf']) {
					var urlspec = this.items[i]['autoLoadJsonConf'];
			
					Ext.Ajax.request({
						disableCaching: true,
						url: urlspec['url'],
						params: urlspec['params'],
						success: function(response, opts) {
						
							alert(response.responseText);
						
							var imported_data = eval('(' + response.responseText + ')');
							thisC.insert(i,imported_data);
							thisC.doLayout();
							
							Ext.apply(this, Ext.apply(this.initialConfig, imported_data));
						},
						failure: function(response, opts) {
							alert('AJAX autoLoadJsonConf FAILED!!!!!!');
						}
					});
					
					delete this.items[i];
				
				
				}
			}
		}
		
		
		
		
		
		
		
		var thisC = this;
		if (thisC.autoLoadJsonConf) {
			
		
			Ext.Ajax.request({
				disableCaching: true,
				url: thisC.autoLoadJsonConf['url'],
				params: thisC.autoLoadJsonConf['params'],
				success: function(response, opts) {
				
					alert(response.responseText);
				
					var imported_data = Ext.util.JSON.decode(response.responseText);
					//var imported_data = eval('(' + response.responseText + ')');
					Ext.apply(this, Ext.apply(this.initialConfig, imported_data));
				},
				failure: function(response, opts) {
					alert('AJAX autoLoadJsonConf FAILED!!!!!!');
				}
			});
		}
		Ext.BoxComponent.superclass.initComponent.apply(this, arguments);
	}
});

*/


Ext.ux.DynContainer = Ext.extend(Ext.Container, {
	
	initComponent: function() {
		
		var id = this.id;
		var imported_data;
		var thisC = this;
		//if (thisC.itemsurl) {
		var config = {
			loadData: function(loadurl,params) {
				
				//alert('Loading: ' + loadurl);

				Ext.Ajax.request({
					disableCaching: true,
					//url: thisC.itemsurl,
					url: loadurl,
					params: params,
					success: function(response, opts) {
						
						imported_data = eval('(' + response.responseText + ')');
						
						thisC.removeAll();
						thisC.add(imported_data);
						thisC.doLayout();
						
					},
					failure: function(response, opts) {
						alert('AJAX FAILED!!!!!!');
					}
				});
			}
		};
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.ux.DynContainer.superclass.initComponent.apply(this, arguments);
		//}
	},
	onRender: function() {
		Ext.ux.DynContainer.superclass.onRender.apply(this, arguments);
		var params = {};
		if(this.urlparams) { params = this.urlparams; delete params["url"]; }
		this.loadData(this.itemsurl,params);
	}
});
Ext.reg('dyncontainer',Ext.ux.DynContainer);


Ext.override(Ext.Container, {
	onRender: function() {
		Ext.Container.superclass.onRender.apply(this, arguments);

		var thisC = this;

		if (this.ajaxitems && Ext.isArray(this.ajaxitems)) {

			for (i in this.ajaxitems) {
				if (this.ajaxitems[i]['url']) {
				
					alert(this.ajaxitems[i]['url']);
					
					Ext.Ajax.request({
						disableCaching: true,
						url: this.ajaxitems[i]['url'],
						params: this.ajaxitems[i]['params'],
						success: function(response, opts) {
							var imported_data = eval('(' + response.responseText + ')');
							thisC.add(new Ext.Container(imported_data));
							thisC.doLayout();
						},
						failure: function(response, opts) {
							alert('AJAX ajaxitems FAILED!!!!!!');
						}
					});
				}
			}
		}
	}
});



/*
Ext.ux.AutoPanel = Ext.extend(Ext.Panel, {
	initComponent: function() {
		var id = this.id;
		var imported_data;
			var config = {
				//onRemove: function(c) {
					//alert('foo');
				//	var Forms = c.findByType('form');
				//	for (f in Forms) {
				//		try { Forms[f].destroy(); } catch(err) {}
				//	}
				//},
				renderer: {
					disableCaching: true,
					render: function(el, response, updater, callback) {
						if (!updater.isUpdating()) {
							try { 
								imported_data = eval('(' + response.responseText + ')'); 
							} 
							catch(err) { 
								return eval(response.responseText); 
							}
							var container = Ext.getCmp(id);
							/*
							//Destroy any Forms if they exist:
							if (container && container.rendered) {
								//alert(container.rendered);
								//alert(container.getXType());
								//var childForm = container.findByType('form');
								var Forms = container.findByType('form');
								for (f in Forms) { try {
									var BasicForm = Forms[f].getForm();
									var fields = BasicForm.getFieldValues();
									for (i in fields) {
										BasicForm.remove(i);
									}
								
								
									//try { Forms[f].removeAll(true); Forms[f].destroy(); } catch(err) {}
								} catch(err) {} }
								
								
								//if (childForm && typof(childForm) == 'object') { alert("'" + childForm + "'"); }
								
								//if (childForm && childForm != '')  { alert('"' + eval(typeof(childForm.prototype.destroy)) + '"'); }
								
								//if (childForm && childForm != '')  { childForm.destroy(); }
								
								//if (childForm) { alert('"' + Ext.type(childForm) + '"'); }
								
								//if (childForm) { alert('"' + Ext.util.JSON.encode(childForm) + '"'); }
								
								//if (childForm) { try { childForm.destroy(); } catch(err) { } }
								
								//if (childForm) { try { childForm.destroy(); } catch(err) { alert('"' + err + '"'); } }
							}
							// ---
							*/
							/*
							
							// --- NEW TRY LINE:
							try { container.removeAll(true); } catch(err) { try { container.removeAll(true); } catch(err) {} }
							container.insert(0,imported_data);
							container.doLayout();
							if (imported_data.rendered_eval) { eval(imported_data.rendered_eval); }
						}
					}
				}
			};
			Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.ux.AutoPanel.superclass.initComponent.apply(this, arguments);
	}
});
Ext.reg('autopanel',Ext.ux.AutoPanel);
*/






Ext.ux.AutoPanel = Ext.extend(Ext.Panel, {
	initComponent: function() {
		
		var id = this.id;
		var imported_data;
			var config = {
				renderer: {
					disableCaching: true,
					render: function(el, response, updater, callback) {
						if (!updater.isUpdating()) {
							try { 
								imported_data = eval('(' + response.responseText + ')'); 
							} 
							catch(err) { 
								return eval(response.responseText); 
							}
							var container = Ext.getCmp(id);

							el.dom.innerHTML = '';
							// --- NEW TRY LINE:
							try { container.removeAll(true); } catch(err) { try { container.removeAll(true); } catch(err) {} }
							container.insert(0,imported_data);
							container.doLayout();
							if (imported_data.rendered_eval) { eval(imported_data.rendered_eval); }
						}
					}
				}
			};
			Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.ux.AutoPanel.superclass.initComponent.apply(this, arguments);
	}
});
Ext.reg('autopanel',Ext.ux.AutoPanel);



/*
Ext.ux.JsonAutoPanel = Ext.extend(Ext.Panel, {
	initComponent: function() {
		
		var id = this.id;
		var imported_data;
			var config = {
				renderer: {
					disableCaching: true,
					render_old: function(el, response, updater, callback) {
						if (!updater.isUpdating()) {
							try { 
								imported_data = eval('(' + response.responseText + ')'); 
							} 
							catch(err) { 
								return eval(response.responseText); 
							}
							var container = Ext.getCmp(id);

							
							// --- NEW TRY LINE:
							try { container.removeAll(true); } catch(err) { try { container.removeAll(true); } catch(err) {} }
							container.insert(0,imported_data);
							container.doLayout();
							if (imported_data.rendered_eval) { eval(imported_data.rendered_eval); }
						}
					},
					render_blah: function(el, response, updateManager, callback) {
						var responseText = response.responseText;
						responseText = responseText.trim();
						//if (response.getResponseHeader['Content-Type'].indexOf('json') > -1) {
							// response is JSON
							// clear loading text
							el.dom.innerHTML = '';
							//var data = Ext.util.JSON.decode(responseText);
							
							var data = eval('(' + response.responseText + ')'); 
							
							var pnl = response.argument.options.container || response.argument.scope;
							
							alert(typeof(pnl));
							
							if (pnl.add) {
							
								alert('foo');
							
								pnl.add(data);
								pnl.doLayout();
							}
							if (callback) {
								callback(data);
							}
							
						//} else {
							// response is HTML, call regular update
						//	el.update(response.responseText, updateManager.loadScripts, callback);
						//}
					},
					render: function(el, response, updater, callback) {
						if (!updater.isUpdating()) {
							try { 
								imported_data = eval('(' + response.responseText + ')'); 
							} 
							catch(err) { 
								return eval(response.responseText); 
							}
							//var container = Ext.getCmp(id);

							el.dom.innerHTML = '';
							var newComponent = new Ext.Container(imported_data);
							newComponent.render(el);
							
							
							// --- NEW TRY LINE:
							//try { container.removeAll(true); } catch(err) { try { container.removeAll(true); } catch(err) {} }
							//container.insert(0,imported_data);
							//container.doLayout();
							//if (imported_data.rendered_eval) { eval(imported_data.rendered_eval); }
						}
					}
				}
			};
			Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.ux.JsonAutoPanel.superclass.initComponent.apply(this, arguments);
	}
});
Ext.reg('jsonautopanel',Ext.ux.JsonAutoPanel);




*/





Ext.ux.DynGridPanel = Ext.extend(Ext.grid.GridPanel, {
	border: false,
	initComponent: function() {
	
		var thisG = this;
		
		var proxy=new Ext.data.HttpProxy({url: this.data_url});
		var reader=new Ext.data.JsonReader(
			{
				root: 'rows',
				totalProperty: 'totalCount'
			}, 
			this.store_model
		);
		
		var store=new Ext.data.Store({
			proxy:proxy,
			reader:reader,
			autoDestroy: true,
			remoteSort: this.remoteSort
		});
		
		var Toolbar = {
			xtype : 'paging',
			store : store,
			displayInfo : true,
			prependButtons: true
		};
		if(this.pageSize) { Toolbar['pageSize'] = parseFloat(this.pageSize); }
		if(this.paging_bbar) { Toolbar['items'] = this.paging_bbar; }

	
		// --------- this doesn't work:
		//var new_column_model = [];
		//for ( var i in this.column_model ) {
		//	if (!this.column_model[i].exclude) {
		//		new_column_model.push(this.column_model[i]);
		//	}
		//}
		//this.column_model = new_column_model;
		
		// ----- RowExpander ------ //
		if (this.expander_template) {
			var expander_config = {};
			expander_config.tpl = new Ext.Template(this.expander_template);
			if (this.getRowClass_eval) { expander_config.getRowClass_eval = this.getRowClass_eval; }
			var expander = new Ext.ux.grid.RowExpanderEX(expander_config);
			this.column_model.unshift(expander);
			if(!this.plugins){ this.plugins = []; }
			this.plugins.push(expander);
			this.expander = expander;
		}
		// ----------------------- //
		
		
		
		
		

		// ----- RowActions ------ //
		if (this.rowactions && this.rowactions.actions) {
			var new_actions = [];
			for (var i in thisG.rowactions.actions) {
				var action_config = thisG.rowactions.actions[i];
				if(this.rowactions.callback_eval) {
					action_config.callback = function(grid, record, action, groupId) { eval(thisG.rowactions.callback_eval); }
				}
				new_actions.push(action_config);
			}
			this.rowactions.actions = new_actions;
			var action = new Ext.ux.grid.RowActions(this.rowactions);
			if(!this.plugins){ this.plugins = []; }
			this.plugins.push(action);
			this.column_model.push(action);
		}
		// ----------------------- //
		
		
		
		// ---------------------------- //
		// ------ Grid Search --------- //
		if (this.gridsearch) {
			
			var grid_search_cnf = {
				iconCls:'icon-zoom',
				//,readonlyIndexes:['note']
				//,disableIndexes:['pctChange']
				//minChars:3, 		// characters to type before the request is made. If undefined (the default)
										// the trigger field shows magnifier icon and you need to click it or press enter for search to start.
				autoFocus:false,
				mode: 'local', // local or remote
				width: 300,
				position: 'top'
				//,menuStyle:'radio'
			};
			
			if (this.gridsearch_remote) { grid_search_cnf['mode'] = 'remote'; }
			
			if(!this.plugins){ this.plugins = []; }
			this.plugins.push(new Ext.ux.grid.Search(grid_search_cnf));
		}
		// ---------------------------- //
		

	 // ------ Grid Filter --------- //
		if(this.gridfilter) {
		
			var grid_filter_cnf = {
				encode: true, // json encode the filter query
				local: true   // defaults to false (remote filtering)
			}
			
			if (this.gridfilter_remote) { grid_filter_cnf['local'] = false; }
		
			if(!this.plugins){ this.plugins = []; }
			this.plugins.push(new Ext.ux.grid.GridFilters(grid_filter_cnf));    
		}
	// ---------------------------- //

		var sm = new Ext.grid.RowSelectionModel();
		
		// ------- SelectionModel -------- //
		if (this.row_checkboxes) {
			sm = new Ext.grid.CheckboxSelectionModel();
			this.column_model.unshift(sm);
		}
		// ------------------------------- //
		
		var config = {
			store: store,
			columns: this.column_model,
			selModel: sm,
			layout: 'fit',
			id: this.gridid,
			loadMask: true,
			storeReload: function() {
				thisG.store.reload();
			},
			
			// ------- http://extjs.com/forum/showthread.php?p=97676#post97676
			autoSizeColumns: function() {
				if (this.colModel) {
					
					this.colModel.suspendEvents();
					for (var i = 0; i < this.colModel.getColumnCount(); i++) {
						this.autoSizeColumn(i);
					}
					this.colModel.resumeEvents();
					this.view.refresh(true);
					this.store.removeListener('load',this.autoSizeColumns,this);

				}
			},
			autoSizeColumn: function(c) {
				var colid = this.colModel.getColumnId(c);
				var column = this.colModel.getColumnById(colid);
				var col = this.view.el.select("td.x-grid3-td-" + colid + " div:first-child");
				if (col) {
				
					var add = 6;
					var w = col.getTextWidth() + Ext.get(col.elements[0]).getFrameWidth('lr') + add;
					
					if (this.MaxColWidth && w > this.MaxColWidth) { w =  this.MaxColWidth; }
					if (column.width && w < column.width) { w = column.width; }
					
					this.colModel.setColumnWidth(c, w);
					return w;
				}
			}
			// ------------------------		
		};
		
		if (Toolbar) { config['bbar'] = Toolbar; }
		
		
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.ux.DynGridPanel.superclass.initComponent.apply(this, arguments);
	},

	onRender: function() {
		
		//var myMask = new Ext.LoadMask(Ext.getBody(), {msg:"Loading data, please wait..."});
		//myMask.show(); 
					
		
		var load_parms = null;
		if (this.pageSize) {
			load_parms = {
				params: {
					start: 0,
					limit: parseFloat(this.pageSize)
				}
			};
		}
		
		this.store.load(load_parms);
		
		Ext.ux.DynGridPanel.superclass.onRender.apply(this, arguments);
		
		var thisC = this;
		
		function StartReloadInterval(mystore,i) {
			function ReloadStore() { mystore.reload(); }
			setInterval(ReloadStore,i);
		}
		if (this.reload_interval > 0) {
			StartReloadInterval(thisC.store,thisC.reload_interval);
		}	
		
		if (this.UseAutoSizeColumns) {
			//this.store.on('load',thisC.autoSizeColumns,thisC);
			this.store.on('load',function(grid) {
				var sizeFunc = function(){thisC.autoSizeColumns();}
				sizeFunc();
			});
		}
		
		
		
		// ---- this is old: 
		/*
		this.on('celldblclick',function(grid, rowIndex, columnIndex, e) {

			var viewPan = Ext.getCmp('viewingPanel');
			viewPan.expand();
			viewPan.doLayout();
			//alert(data);
		});
		*/
		// -----------------
		
		this.on('cellclick',function(grid, rowIndex, columnIndex, e) {
			var record = grid.getStore().getAt(rowIndex);  // Get the Record
			var col_model = grid.getColumnModel();
			var fieldName = col_model.getDataIndex(columnIndex); // Get field name
			
			if (this.expander && this.expander_click_rows) {
				if (this.expander_click_rows[columnIndex]) {
					this.expander.toggleRow(rowIndex);
				}
			}
			
			//var colid = col_model.getColumnId(fieldName);
			//var column = col_model.getColumnById(colid);
			
		});
		
		
		// ------ Cell Doubleclick -------- //
		if(this.celldblclick_eval) {
			//alert(thisC.rowbodydblclick_eval);
			//this.on('rowbodydblclick', function(grid, rowIndex, e) {
			this.on('celldblclick', function(grid, rowIndex, columnIndex, e) {
				var record = grid.getStore().getAt(rowIndex);
				var fieldName = grid.getColumnModel().getDataIndex(columnIndex);
				eval(this.celldblclick_eval);
			});
		}
		// -------------------------------- //
		
		//window.busy = false;
		
		//myMask.hide(); 
		
	}
});
Ext.reg('dyngrid',Ext.ux.DynGridPanel);




Ext.ux.DButton = Ext.extend(Ext.Button, {

	initComponent: function() {
		
		if (this.handler_func) {
			var config = {
				handler: function(btn) { eval(this.handler_func); }
			};
			Ext.apply(this, Ext.apply(this.initialConfig, config));
		}
		Ext.ux.DButton.superclass.initComponent.apply(this, arguments);
	},
	afterRender: function() {
		if (this.submitFormOnEnter) {
			var formPanel = this.findParentByType('form');
			if (!formPanel) {
				formPanel = this.findParentByType('submitform');
			}
			new Ext.KeyMap(formPanel.el, {
				key: Ext.EventObject.ENTER,
				shift: false,
				alt: false,
				fn: function(keyCode, e){
						if(e.target.type === 'textarea' && !e.ctrlKey) {
							return true;
						}
						this.el.select('button').item(0).dom.click();
						return false;
				},
				scope: this
			});
		}
		Ext.ux.DButton.superclass.afterRender.apply(this, arguments);
	}
});
Ext.reg('dbutton',Ext.ux.DButton);


Ext.ux.TreePanelExt = Ext.extend(Ext.tree.TreePanel, {

	onRender: function() {
		if (this.click_handler_func) {
			this.on('click',function(node,e) { if (node) { eval(this.click_handler_func); }});
		}

		Ext.ux.TreePanelExt.superclass.onRender.apply(this, arguments);
	},
	afterRender: function() {
		Ext.ux.TreePanelExt.superclass.afterRender.apply(this, arguments);
		
		if (this.expand) { this.expandAll(); }
		
		if (this.afterRender_eval) {
			
			eval(this.afterRender_eval);
			
			/*
			var eval_str = this.afterRender_eval;
			var task = new Ext.util.DelayedTask(function() { eval(eval_str); });
			task.delay(500);
			*/
			
		}
	}
});
Ext.reg('treepanelext',Ext.ux.TreePanelExt );


// learned about this from: http://www.diloc.de/blog/2008/03/05/how-to-submit-ext-forms-the-right-way/
Ext.ux.JSONSubmitAction = function(form, options){
    Ext.ux.JSONSubmitAction.superclass.constructor.call(this, form, options);
};
Ext.extend(Ext.ux.JSONSubmitAction, Ext.form.Action.Submit, {

	type : 'jsonsubmit',

	run : function(){
		  var o = this.options,
				method = this.getMethod(),
				isGet = method == 'GET';
		  if(o.clientValidation === false || this.form.isValid()){
				if (o.submitEmptyText === false) {
					 var fields = this.form.items,
						  emptyFields = [];
					 fields.each(function(f) {
						  if (f.el.getValue() == f.emptyText) {
								emptyFields.push(f);
								f.el.dom.value = "";
						  }
					 });
				}
				
				var ajax_params = o.base_params ? o.base_params : {};
				ajax_params['json_params'] = Ext.util.JSON.encode(this.form.getFieldValues());
				
				Ext.Ajax.request(Ext.apply(this.createCallback(o), {
					 //form:this.form.el.dom,  <--- need to remove this line to prevent the form items from being submitted
					 url:this.getUrl(isGet),
					 method: method,
					 headers: o.headers,
					 //params:!isGet ? this.getParams() : null,
					 params: ajax_params,
					 isUpload: this.form.fileUpload
				}));
				if (o.submitEmptyText === false) {
					 Ext.each(emptyFields, function(f) {
						  if (f.applyEmptyText) {
								f.applyEmptyText();
						  }
					 });
				}
		  }else if (o.clientValidation !== false){ // client validation failed
				this.failureType = Ext.form.Action.CLIENT_INVALID;
				this.form.afterAction(this, false);
		  }
	 }
});
//add our action to the registry of known actions
Ext.form.Action.ACTION_TYPES['jsonsubmit'] = Ext.ux.JSONSubmitAction;


Ext.ux.SubmitFormPanel = Ext.extend(Ext.form.FormPanel, {

	initComponent: function() {
		
		var thisC = this;
	
		var config = {
			resultProcessor: function(form, action) {
				thisC.el.unmask();
				if (action.result.success) {
					if (thisC.show_result) { Ext.MessageBox.alert('Success',action.result.msg); }
					if (thisC.onSuccess_eval) { eval(thisC.onSuccess_eval); }
				}
				else {
					if (thisC.onFail_eval) { eval(thisC.onFail_eval); }
					if (thisC.show_result) { Ext.MessageBox.alert('Failure',action.result.msg); }
				}
			},
			
			submitProcessor: function() {
				
				var do_action = this.do_action ? this.do_action : 'submit';
				var base_params = this.base_params ? this.base_params : {};
				
				this.el.mask('Please wait','x-mask-loading');
				//this.getForm().submit({
				//this.getForm().doAction('jsonsubmit',{
				this.getForm().doAction(do_action,{
					url: this.url,
					base_params: base_params,
					nocache: true,
					success: this.resultProcessor,
					failure: this.resultProcessor
				});
			}
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.ux.SubmitFormPanel.superclass.initComponent.apply(this, arguments);
	},

	afterRender: function() {
	
		//if (this.map_enter_submit) {
		//	var map = new Ext.KeyMap(document, {
		//		key: 13,
		//		//scope: this,
		//		fn: function() { alert('enter!'); }
		//	});
		//}
		
		if (this.action_load) {
			var action_load = this.action_load;
			action_load['waitTitle'] = 'Loading';
			action_load['waitMsg'] = 'Loading data';
			this.getForm().load(action_load);
		}
	
		if (this.focus_field_id) {
			var field = Ext.getCmp(this.focus_field_id);
			if (field) { field.focus('',10); }
		}
		Ext.ux.SubmitFormPanel.superclass.afterRender.apply(this, arguments);
	}
});
Ext.reg('submitform',Ext.ux.SubmitFormPanel );




// Tweaks to Saki's "CheckTree" (http://checktree.extjs.eu/) -- 2010-03-27 by HV
Ext.override(Ext.ux.tree.CheckTreePanel, {
	// This is required in order to get initial checked state:
	afterRender:function() {
		Ext.ux.tree.CheckTreePanel.superclass.afterRender.apply(this, arguments);
		this.updateHidden();
	 },
	 
	 // This adds unchecked items to the posted list... Unchecked start with '-', checked start with '+'
	 getValue:function() {
		var a = [];
		this.root.cascade(function(n) {
			if(true === n.attributes.checked) {
				if(false === this.deepestOnly || !this.isChildChecked(n)) {
					a.push('+' + n.id);
				}
			}
			else {
				a.push('-' + n.id);
			}
		}, this);
		a.shift(); // Remove root element
		return a;
	}
});


/* Override to force it to not display the checkbox if "checkbox" is null */
Ext.override(Ext.ux.tree.CheckTreeNodeUI, {

	renderElements:function(n, a, targetNode, bulkRender){
		
		/* This override was required to support NO checkbox */
		var checkbox_class = 'x-tree-checkbox';
		if (n.attributes.checked == null) { checkbox_class = 'x-tree-checkbox-no-checkbox'; }
		/* ------------------------------------------------- */
		
		this.indentMarkup = n.parentNode ? n.parentNode.ui.getChildIndent() :'';
		var checked = n.attributes.checked;
		var href = a.href ? a.href : Ext.isGecko ? "" :"#";
        var buf = [
			 '<li class="x-tree-node"><div ext:tree-node-id="',n.id,'" class="x-tree-node-el x-tree-node-leaf x-unselectable ', a.cls,'" unselectable="on">'
			,'<span class="x-tree-node-indent">',this.indentMarkup,"</span>"
			,'<img src="', this.emptyIcon, '" class="x-tree-ec-icon x-tree-elbow" />'
			,'<img src="', a.icon || this.emptyIcon, '" class="x-tree-node-icon',(a.icon ? " x-tree-node-inline-icon" :""),(a.iconCls ? " "+a.iconCls :""),'" unselectable="on" />'
			,'<img src="'+this.emptyIcon+'" class="' + checkbox_class +(true === checked ? ' x-tree-node-checked' :'')+'" />'
			,'<a hidefocus="on" class="x-tree-node-anchor" href="',href,'" tabIndex="1" '
			,a.hrefTarget ? ' target="'+a.hrefTarget+'"' :"", '><span unselectable="on">',n.text,"</span></a></div>"
			,'<ul class="x-tree-node-ct" style="display:none;"></ul>'
			,"</li>"
		].join('');
		var nel;
		if(bulkRender !== true && n.nextSibling && (nel = n.nextSibling.ui.getEl())){
			this.wrap = Ext.DomHelper.insertHtml("beforeBegin", nel, buf);
		}else{
			this.wrap = Ext.DomHelper.insertHtml("beforeEnd", targetNode, buf);
		}
		this.elNode = this.wrap.childNodes[0];
		this.ctNode = this.wrap.childNodes[1];
		var cs = this.elNode.childNodes;
		this.indentNode = cs[0];
		this.ecNode = cs[1];
		this.iconNode = cs[2];
		this.checkbox = cs[3];
		this.cbEl = Ext.get(this.checkbox);
		this.anchor = cs[4];
		this.textNode = cs[4].firstChild;
	} // eo function renderElements
});




/*
Ext.override(Ext.chart.LineChart, {
	initComponent: function() {
		var config = this;
		if (this.xAxis && this.xAxis['xtype']) {
			if(this.xAxis['xtype'] == 'categoryaxis') { config['xAxis'] = new Ext.chart.CategoryAxis(this.xAxis); }
			if(this.xAxis['xtype'] == 'numericaxis') { config['xAxis'] = new Ext.chart.NumericAxis(this.xAxis); }
		}
		if (this.yAxis && this.yAxis['xtype']) {
			if(this.yAxis['xtype'] == 'categoryaxis') { config['yAxis'] = new Ext.chart.CategoryAxis(this.yAxis); }
			if(this.yAxis['xtype'] == 'numericaxis') { config['yAxis'] = new Ext.chart.NumericAxis(this.yAxis); }
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.chart.LineChart.superclass.initComponent.apply(this, arguments);
	}
});
*/


var pxMatch = /(\d+(?:\.\d+)?)px/;
Ext.override(Ext.Element, {
        getViewSize : function(contentBox){
            var doc = document,
                me = this,
                d = me.dom,
                extdom = Ext.lib.Dom,
                isDoc = (d == doc || d == doc.body),
                isBB, w, h, tbBorder = 0, lrBorder = 0,
                tbPadding = 0, lrPadding = 0;
            if (isDoc) {
                return { width: extdom.getViewWidth(), height: extdom.getViewHeight() };
            }
            isBB = me.isBorderBox();
            tbBorder = me.getBorderWidth('tb');
            lrBorder = me.getBorderWidth('lr');
            tbPadding = me.getPadding('tb');
            lrPadding = me.getPadding('lr');

            // Width calcs
            // Try the style first, then clientWidth, then offsetWidth
            if (w = me.getStyle('width').match(pxMatch)){
                if ((w = Math.round(w[1])) && isBB){
                    // Style includes the padding and border if isBB
                    w -= (lrBorder + lrPadding);
                }
                if (!contentBox){
                    w += lrPadding;
                }
                // Minimize with clientWidth if present
                d.clientWidth && (d.clientWidth < w) && (w = d.clientWidth);
            } else {
                if (!(w = d.clientWidth) && (w = d.offsetWidth)){
                    w -= lrBorder;
                }
                if (w && contentBox){
                    w -= lrPadding;
                }
            }

            // Height calcs
            // Try the style first, then clientHeight, then offsetHeight
            if (h = me.getStyle('height').match(pxMatch)){
                if ((h = Math.round(h[1])) && isBB){
                    // Style includes the padding and border if isBB
                    h -= (tbBorder + tbPadding);
                }
                if (!contentBox){
                    h += tbPadding;
                }
                // Minimize with clientHeight if present
                d.clientHeight && (d.clientHeight < h) && (h = d.clientHeight);
            } else {
                if (!(h = d.clientHeight) && (h = d.offsetHeight)){
                    h -= tbBorder;
                }
                if (h && contentBox){
                    h -= tbPadding;
                }
            }

            return {
                width : w,
                height : h
            };
        }
});

Ext.override(Ext.layout.ColumnLayout, {
    onLayout : function(ct, target, targetSize){
        var cs = ct.items.items, len = cs.length, c, i;

        if(!this.innerCt){
            // the innerCt prevents wrapping and shuffling while
            // the container is resizing
            this.innerCt = target.createChild({cls:'x-column-inner'});
            this.innerCt.createChild({cls:'x-clear'});
        }
        this.renderAll(ct, this.innerCt);

        var size = targetSize || target.getViewSize(true);

        if(size.width < 1 && size.height < 1){ // display none?
            return;
        }

        var w = size.width - this.scrollOffset,
            h = size.height,
            pw = w;

        this.innerCt.setWidth(w);

        // some columns can be percentages while others are fixed
        // so we need to make 2 passes

        for(i = 0; i < len; i++){
            c = cs[i];
            if(!c.columnWidth){
                pw -= (c.getSize().width + c.getPositionEl().getMargins('lr'));
            }
        }

        pw = pw < 0 ? 0 : pw;

        for(i = 0; i < len; i++){
            c = cs[i];
            if(c.columnWidth){
                c.setSize(Math.floor(c.columnWidth * pw) - c.getPositionEl().getMargins('lr'));
            }
        }
        // Do a second pass if the layout resulted in a vertical scrollbar (changing the available width)
        if (!targetSize && ((size = target.getViewSize(true)).width != w)) {
            this.onLayout(ct, target, size);
        }
    }
});


//Ext.reg('categoryaxis',Ext.chart.CategoryAxis );
//Ext.reg('numericaxis',Ext.chart.NumericAxis );

//Ext.QuickTips = function(){};

//Ext.override(Ext.QuickTips, function() {});



Ext.override(Ext.ux.Printer.BaseRenderer, { stylesheetPath: '/static/js/Ext.ux.Printer/print.css' });

/*
 * Prints the contents of an Ext.Panel
*/
Ext.ux.Printer.PanelRenderer = Ext.extend(Ext.ux.Printer.BaseRenderer, {

/*
  * Generates the HTML fragment that will be rendered inside the <html> element of the printing window
 */
	generateBody: function(panel) {
		return String.format("<div class='x-panel-print'>{0}</div>", panel.body.dom.innerHTML);
	}
});

Ext.ux.Printer.registerRenderer("panel", Ext.ux.Printer.PanelRenderer);


