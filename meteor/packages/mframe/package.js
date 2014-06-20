Package.describe({
    summary: "Meteor iFrame Interface"
});

Package.on_use(function (api) {
    api.add_files('mframe.js', ['client', 'server']);
    api.export('connectMFrame');
});