const core = require("@actions/core");
const fs = require("fs");
const github = require("@actions/github");
const io = require("@actions/io");
const retry = require("async-retry");
const semver = require("semver");
const tc = require("@actions/tool-cache");

const NEXTFLOW_REPO = { owner: "nextflow-io", repo: "nextflow" };

async function all_nf_releases(ok) {
  const { data: releases } = await ok.rest.repos.listReleases(NEXTFLOW_REPO);

  return releases;
}

async function latest_stable_release_data(ok) {
  const { data: stable_release } = await ok.rest.repos.getLatestRelease(
    NEXTFLOW_REPO
  );

  return stable_release;
}

async function release_data(version, ok) {
  // Setup tag-based filtering
  filter = (r) => {
    return semver.satisfies(r.tag_name, version, true);
  };

  // Check if the user passed a 'latest*' tag, and override filtering
  // accordingly
  if (version.includes("latest")) {
    if (version.includes("-everything")) {
      // No filtering
      filter = (r) => {
        return true;
      };
    } else if (version.includes("-edge")) {
      filter = (r) => {
        return r.tag_name.endsWith("-edge");
      };
    } else {
      // This is special: passing 'latest' or 'latest-stable' allows us to use
      // the latest stable GitHub release direct from the API
      stable_release = await latest_stable_release_data(ok);
      return stable_release;
    }
  }

  // Get all the releases
  const all_releases = await all_nf_releases(ok);

  matching_releases = all_releases.filter(filter);

  matching_releases.sort(function (x, y) {
    semver.compare(x.tag_name, y.tag_name, true);
  });

  return matching_releases[0];
}

function nextflow_bin_url(release, get_all) {
  const release_assets = release.assets;
  const all_asset = release_assets.filter((a) => {
    return a.browser_download_url.endsWith("-all");
  })[0];
  const regular_asset = release_assets.filter((a) => {
    return a.name == "nextflow";
  })[0];

  const dl_asset = get_all ? all_asset : regular_asset;

  return dl_asset.browser_download_url;
}

async function install_nextflow(url, version) {
  core.debug(`Downloading Nextflow from ${url}`);
  const nf_dl_path = await retry(
    async (bail) => {
      return await tc.downloadTool(url);
    },
    {
      onRetry: (err) => {
        core.debug(`Download of ${url} failed, trying again. Error ${err}`);
      },
    }
  );

  const temp_install_dir = fs.mkdtempSync(`nxf-${version}`);

  const nf_path = await io.mv(nf_path, `${temp_install_dir}/nextflow`, {
    force: true,
  });
  fs.chmod(nf_path, "+x");

  return temp_install_dir;
}

async function run() {
  // Read in the arguments
  const token = core.getInput("token");
  const version = core.getInput("version");
  const get_all = core.getBooleanInput("all");

  // Setup the API
  let octokit = {};
  try {
    octokit = github.getOctokit(token);
  } catch (e) {
    core.setFailed(
      `Could not authenticate to GitHub Releases API with provided token\n${e.message}`
    );
  }

  // Get the release info for the desired release
  let release = {};
  try {
    release = await release_data(version, octokit);
    core.info(
      `Input version '${version}' resolved to Nextflow ${release.name}`
    );
  } catch (e) {
    core.setFailed(
      `Could not retrieve Nextflow release matching ${version}.\n${e.message}`
    );
  }

  // Get the download url for the desired release
  let url = "";
  try {
    url = nextflow_bin_url(release, get_all);
    core.info(`Preparing to download from ${url}`);
  } catch (e) {
    core.setFailed(`Could not parse the download URL\n${e.message}`);
  }
  try {
    // Download Nextflow and add it to path
    let nf_path = "";
    nf_path = tc.find("nextflow", version);

    if (!nf_path) {
      core.debug(`Could not find Nextflow ${version} in cache`);
      const nf_install_path = await install_nextflow(url, version);

      nf_path = await tc.cacheDir(nf_install_path, "nextflow", version);
      core.debug(`Added Nextflow to cache: ${nf_path}`);

      io.rmRF(nf_install_path);
    } else {
      core.debug(`Using cached version of Nextflow: ${nf_path}`);
    }

    core.addPath(nf_path);

    core.info(`Downloaded \`nextflow\` to ${nf_path} and added to PATH`);
  } catch (e) {
    core.setFailed(e.message);
  }
}

run();
