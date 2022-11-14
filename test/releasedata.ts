import * as github from '@actions/github'
import {release_data} from '../src/functions'
import {getToken} from './utils'
import anyTest, {TestFn} from 'ava' // eslint-disable-line import/no-unresolved

const test = anyTest as TestFn<{foo: string}>

test.before(t => {
  const first = true
  const current_token = getToken(first)
  t.context = {token: current_token}
  t.context = {octokit: github.getOctokit(current_token)}
})

const macro = test.macro(async (t, version: string, expected: string) => {
  const result = await release_data(version, t.context['octokit'])
  t.is(result['tag_name'], expected)
})

test('hard version', macro, 'v22.10.2', 'v22.10.2')
test('latest-stable', macro, 'latest-stable', 'v22.10.2')
test('latest-edge', macro, 'latest-edge', 'v22.09.7-edge')
test('latest-everything', macro, 'latest-everything', 'v22.10.2')