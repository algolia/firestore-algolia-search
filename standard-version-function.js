const PATTERN = /version\s+=\s+['|"](.*?)['|"]/;

const getVersion = contents => {
  return PATTERN.exec(contents)[1];
};

module.exports.readVersion = function (contents) {
  return getVersion(contents);
}

module.exports.writeVersion = function (contents, version) {
  const oldVersion = getVersion(contents);
  return contents.replace(oldVersion, version);
}
