# Changelog

All notable changes to this project will be documented in this file.

## Planned

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Story Points</th>
			<th>Priority</th>
			<th>Assignee</th>
			<th>GitHub Issue</th>
			<th>Completed</th>
			<th>Pull Request</th>
			<th>Merged</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Detect if "week" view is including weekend</td>
			<td>5</td>
			<td>🏕 Medium</td>
			<td></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/158">#158</a></td>
			<td>No</td>
			<td></td>
			<td>No</td>
			<td>Could do it using this API endpoint: https://developers.google.com/calendar/api/v3/reference/settings/list or though DOM</td>
		</tr>
		<tr>
			<td>Enhance the calendar picker</td>
			<td>5</td>
			<td>🏝 Low</td>
			<td></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/174">#174</a></td>
			<td>No</td>
			<td></td>
			<td>No</td>
			<td>
				When creating a calendar, there is a calendar picker<br>
				The picker shows all calendar names in black.<br>
				If there are a lot of calendars, it takes time to find the right one<br>
				It would be helpful to have each line in the calendar picker be colored in some way using the calendar's theme color
			</td>
		</tr>
		<tr>
			<td>Make extension work in Firefox</td>
			<td>13</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/150">#150</a></td>
			<td>No</td>
			<td></td>
			<td>No</td>
			<td>Guide: https://extensionworkshop.com/documentation/develop/browser-compatibility</td>
		</tr>
		<tr>
			<td>Provide a way to independently rename a calendar</td>
			<td>13</td>
			<td>🏝 Low</td>
			<td></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/173">#173</a></td>
			<td>No</td>
			<td></td>
			<td>No</td>
			<td>
				If you have view access to some calendars, but no edit access, you can't rename them.<br>
				What is more, even if you do have permission to rename the calendar, renaming the calendar would apply the change to everyone - there is no way for different people to have different calendar names.<br>
				Our extension could add that feature
			</td>
		</tr>
		<tr>
			<td>Add a faster way to set notifications</td>
			<td>13</td>
			<td>🏔 High</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td></td>
			<td>No</td>
			<td></td>
			<td>No</td>
			<td>Allow putting something like 10m.1h.1d in the event title and have extension conver that into notifications. The dificulty is that this would involve pressing a lot of buttons and opening dialogs on user's behalf (as setting notifications requires quite a few button clicks)</td>
		</tr>
		<tr>
			<td>Display the goals badge in Google Calendar header</td>
			<td>13</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/jakeangus">jakeangus</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/76">#76</a></td>
			<td>No</td>
			<td></td>
			<td>No</td>
			<td>Display the progress toward each goal in a badge in the google calendar header. Piggy back on the colors of each calendar when displaying the badge. Clicking on the badge would open the overlay</td>
		</tr>
		<tr>
			<td>Add export to XLSX</td>
			<td>8</td>
			<td>🏝 Low</td>
			<td></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/155">#155</a></td>
			<td>No</td>
			<td></td>
			<td>No</td>
			<td>
				Currently, data export to CSV and TSV is supported.<br>
				Adding XLSX support would be cool, though perhaps a bit tricky as it would require adding a large library - thus this is optional
			</td>
		</tr>
		<tr>
			<td>Add indicator for events with description</td>
			<td>8</td>
			<td>🏕 Medium</td>
			<td></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/181">#181</a></td>
			<td>No</td>
			<td></td>
			<td>No</td>
			<td>
				Google Calendar does not show previews of descriptions for events that have descriptions nor does it provide an indicator that even has a description.<br>
				As a result, it's easy to add some important details about the event into the description and forget that it's there.<br>
				Some sort of indicator would be wonderful (i.e, a red corner or a stripe)<br>
				The difficulty is that there is no indication in the DOM that an element has an event, thus we would have to make network requests to get this information. And there would have to be a separate network request for each calendar. And if user is rapidly moving though calendars, that's a lot of network requests...
			</td>
		</tr>
	</tbody>
</table>

## Sprint #13

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Story Points</th>
			<th>Priority</th>
			<th>Assignee</th>
			<th>GitHub Issue</th>
			<th>Completed</th>
			<th>Pull Request</th>
			<th>Merged</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Add an explicit "Sign in with Google" button</td>
			<td>3</td>
			<td>🌋 Urgent</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/214">#214</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/213">#213</a></td>
			<td>Yes</td>
			<td>
				Our OAuth Consent Screen application was rejected again.<br>
				This time because the Google OAuth button didn't follow the branding requirements.<br>
				See https://developers.google.com/identity/branding-guidelines
			</td>
		</tr>
		<tr>
			<td>Record an introductory demo video</td>
			<td>3</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td></td>
			<td>Yes</td>
			<td></td>
			<td>Yes</td>
			<td>
				Rather than a video that goes over all features, record a 3-5 minute video that gives a quick introduction to basic features of the extension - for jump starting new users<br>
				Edit: I cut the video that goes over all features into a shorter format and posted that publicly on the extension page
			</td>
		</tr>
		<tr>
			<td>Detect selected time zone</td>
			<td>5</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/jakeangus">jakeangus</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/59">#59</a></td>
			<td>No</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/202">#202</a></td>
			<td>No</td>
			<td>
				Currently, the plugin assumes that Google Calendar's time zone matched the system time zone.<br>
				That is not always the case as user can change Google Calendar's time zone independently
			</td>
		</tr>
		<tr>
			<td>Improve test coverage</td>
			<td>5</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/jetsemr">jetsemr</a></td>
			<td></td>
			<td>No</td>
			<td></td>
			<td>No</td>
			<td></td>
		</tr>
		<tr>
			<td>Make extension work in Edge</td>
			<td>3</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/Durbatuluk1701">Durbatuluk1701</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/151">#151</a></td>
			<td>No</td>
			<td></td>
			<td>No</td>
			<td>
				Guide: https://extensionworkshop.com/documentation/develop/browser-compatibility/Documentation: https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/developer-guide/port-chrome-extension<br>
				See also https://github.com/maxpatiiuk/calendar-plus/issues/150
			</td>
		</tr>
		<tr>
			<td>Allow hiding virtual categories</td>
			<td>8</td>
			<td>🏔 High</td>
			<td><a href="https://github.com/jetsemr">jetsemr</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/124">#124</a></td>
			<td>No</td>
			<td></td>
			<td>No</td>
			<td>
				Calendar categories (virtual calendars) would become even more useful once we have the ability to hide them.<br>
				This would, for example, allow excluding from the charts events whose name match a certain rule, or just temporary peeking at what the charts might look like without some categories
			</td>
		</tr>
		<tr>
			<td>Do a quad chart</td>
			<td>13</td>
			<td>🌋 Urgent</td>
			<td><a href="https://github.com/jakeangus">jakeangus</a></td>
			<td></td>
			<td>No</td>
			<td></td>
			<td>No</td>
			<td>See instructions and rubrics on Canvas. Due May 3rd</td>
		</tr>
		<tr>
			<td>Make time series chart use AM/PM when appropriate</td>
			<td>2</td>
			<td>🏕 Medium</td>
			<td></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/179">#179</a></td>
			<td>No</td>
			<td></td>
			<td>No</td>
			<td>Currently, it always uses 24 hour time. Instead, need to modify it to listen for user's preference for AM/PM vs 24 time</td>
		</tr>
		<tr>
			<td>General testing</td>
			<td>5</td>
			<td>🌋 Urgent</td>
			<td></td>
			<td></td>
			<td>No</td>
			<td></td>
			<td>No</td>
			<td>Need to do general testing of all the features to improve stability. Open GitHub bugs for discovered issues and add a corresponding row to this table</td>
		</tr>
		<tr>
			<td>Detect last used view</td>
			<td>3</td>
			<td>🏕 Medium</td>
			<td></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/129">#129</a></td>
			<td>No</td>
			<td></td>
			<td>No</td>
			<td>See #78 (comment)</td>
		</tr>
		<tr>
			<td>Add a loading indicator</td>
			<td>3</td>
			<td>🏝 Low</td>
			<td></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/157">#157</a></td>
			<td>No</td>
			<td></td>
			<td>No</td>
			<td>When events are being fetched or any other async action is happening, a proper loading indicator (or a loading skeleton) needs to be visible</td>
		</tr>
		<tr>
			<td>Fill out CHANGELOG.md</td>
			<td>2</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td></td>
			<td>No</td>
			<td></td>
			<td>No</td>
			<td>Fill it out based on this spreadsheet or upload this spreadsheet to GitHub</td>
		</tr>
	</tbody>
</table>

## Sprint #12

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Story Points</th>
			<th>Priority</th>
			<th>Assignee</th>
			<th>GitHub Issue</th>
			<th>Completed</th>
			<th>Pull Request</th>
			<th>Merged</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Create a demo video from the snippets and voice it</td>
			<td>13</td>
			<td>🌋 Urgent</td>
			<td><a href="https://github.com/jakeangus">jakeangus</a></td>
			<td></td>
			<td>Yes</td>
			<td></td>
			<td>Yes</td>
			<td></td>
		</tr>
		<tr>
			<td>Investigate migrating to Firefox</td>
			<td>5</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/150">#150</a></td>
			<td>Yes</td>
			<td></td>
			<td>Yes</td>
			<td>Results of investigation: https://github.com/maxpatiiuk/calendar-plus/issues/150#issuecomment-1494660524</td>
		</tr>
		<tr>
			<td>Write privacy policy</td>
			<td>5</td>
			<td>🌋 Urgent</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/210">#210</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/209">#209</a></td>
			<td>Yes</td>
			<td>It is required by Google to pass OAuth Consent Screen. Limited Use disclosure is needed too</td>
		</tr>
		<tr>
			<td>Comply with OAuth Consent Screen requirements</td>
			<td>5</td>
			<td>🌋 Urgent</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td></td>
			<td>Yes</td>
			<td></td>
			<td>Yes</td>
			<td>
				They sent me a long list of things to fix after my initial application. Including the following:<br>
				- Record a demo video of how OAuth is used in the extension<br>
				- Write privacy policy and limited use disclosure<br>
				- Add a favicon (browser tab icon) to the homepage of the extension documentation<br>
				- Verify my ownership of the patii.uk domain (it hosts the documentation for the extension)
			</td>
		</tr>
		<tr>
			<td>Add a way to unghost an event</td>
			<td>3</td>
			<td>🌋 Urgent</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/207">#207</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/212">#212</a></td>
			<td>Yes</td>
			<td>In case you accidentally ghosted an event or wanted to just temporary ghost it</td>
		</tr>
		<tr>
			<td>Extension does not work on first sign in</td>
			<td>5</td>
			<td>🌋 Urgent</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/211">#211</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/212">#212</a></td>
			<td>Yes</td>
			<td>Seems to be fixed after reloading the page. Quite strange</td>
		</tr>
	</tbody>
</table>

## Sprint #11

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Story Points</th>
			<th>Priority</th>
			<th>Assignee</th>
			<th>GitHub Issue</th>
			<th>Completed</th>
			<th>Pull Request</th>
			<th>Merged</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Record video snippets for the demo</td>
			<td>3</td>
			<td>🌋 Urgent</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td></td>
			<td>Yes</td>
			<td></td>
			<td>Yes</td>
			<td></td>
		</tr>
		<tr>
			<td>Overlay container is cut off at the bottom</td>
			<td>3</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/jakeangus">jakeangus</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/127">#127</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/203">#203</a></td>
			<td>Yes</td>
			<td>The overlay container is cut off a bit at the bottom</td>
		</tr>
		<tr>
			<td>Fix a dozen discovered small issues</td>
			<td>5</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/201">#201</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/204">#204</a></td>
			<td>Yes</td>
			<td>
				Things needed to fix:<br>
				Fix "Calendar Plus" button not appearing for new users<br>
				Fix week offset not being added correctly<br>
				Use box-sizing border-box everywhere<br>
				Cache weekStart in storage (Fixes Cache the UserSettings in Local Storage #201)<br>
				Refactor week start detection code<br>
				Increase max height of Virtual Calendars<br>
				Fix header condensing styles not being applied<br>
				Fix duration picker being not wide enough
			</td>
		</tr>
		<tr>
			<td>Research promotion strategy for extension</td>
			<td>3</td>
			<td>🏔 High</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td></td>
			<td>Yes</td>
			<td></td>
			<td>Yes</td>
			<td>Figure out how to best promote the extension, what options we have and how should we proceed</td>
		</tr>
		<tr>
			<td>Cache the UserSettings in Local Storage</td>
			<td>2</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/Durbatuluk1701">Durbatuluk1701</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/201">#201</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/204">#204</a></td>
			<td>Yes</td>
			<td>User Settings should be stored in local storage and retrieved periodically, where default is to pull from Local Storage</td>
		</tr>
	</tbody>
</table>

## Sprint #10

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Story Points</th>
			<th>Priority</th>
			<th>Assignee</th>
			<th>GitHub Issue</th>
			<th>Completed</th>
			<th>Pull Request</th>
			<th>Merged</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Detect first day of the week</td>
			<td>5</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/Durbatuluk1701">Durbatuluk1701</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/60">#60</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/199">#199</a></td>
			<td>Yes</td>
			<td>
				Currently, the extension assumes Sunday is the first day of the week.<br>
				This is not always the case. User can customize this in Calendar settings. The extension should piggy-back on that setting
			</td>
		</tr>
		<tr>
			<td>Publish extension to Google WebStore</td>
			<td>5</td>
			<td>🌋 Urgent</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/152">#152</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/200">#200</a></td>
			<td>Yes</td>
			<td>
				So that it's publicly visible<br>
				Also need to make screenshots, description and demo videos
			</td>
		</tr>
	</tbody>
</table>

## Sprint #9

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Story Points</th>
			<th>Priority</th>
			<th>Assignee</th>
			<th>GitHub Issue</th>
			<th>Completed</th>
			<th>Pull Request</th>
			<th>Merged</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Handle auth token expiration</td>
			<td>3</td>
			<td>🏔 High</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/188">#188</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/189">#189</a></td>
			<td>Yes</td>
			<td>
				Need to refresh the access token when necessary.<br>
				Currently, if the tab is left open for a long time, the toke eventually expires and all requests fail until the page reload.
			</td>
		</tr>
		<tr>
			<td>Extension is broken if page is loaded with sidebar collapsed</td>
			<td>5</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/101">#101</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/190">#190</a></td>
			<td>Yes</td>
			<td>
				If the page is loaded with sidebar collapsed (Google Calendar remembers if you collapsed it in previous session), then Calendar Plus extension fails to read the list of currently visible calendars, leading it to treat all calendars as disabled.<br>
				Should fix this by caching the list of calendars that were visible last time and updating that list once the sidebar is expanded again
			</td>
		</tr>
		<tr>
			<td>Add settings import/export feature</td>
			<td>2</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/193">#193</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/194">#194</a></td>
			<td>Yes</td>
			<td>Add ability to export layout, preferences, autocomplete predictions and other settings (but also to import them)</td>
		</tr>
		<tr>
			<td>Extend export to JSON/TSV to every widget</td>
			<td>3</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/191">#191</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/192">#192</a></td>
			<td>Yes</td>
			<td></td>
		</tr>
		<tr>
			<td>Add a "Condenced" UI mode</td>
			<td>5</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/161">#161</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/197">#197</a></td>
			<td>Yes</td>
			<td>
				Google Calendar does not show previews of descriptions for events that have descriptions nor does it provide an indicator that even has a description.<br>
				As a result, it's easy to add some important details about the event into the description and forget that it's there.<br>
				Some sort of indicator would be wonderful (i.e, a red corner or a stripe)
			</td>
		</tr>
	</tbody>
</table>

## Sprint #8

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Story Points</th>
			<th>Priority</th>
			<th>Assignee</th>
			<th>GitHub Issue</th>
			<th>Completed</th>
			<th>Pull Request</th>
			<th>Merged</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Add a 24hr time allocation visualization</td>
			<td>13</td>
			<td>🏔 High</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/165">#165</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/175">#175</a></td>
			<td>Yes</td>
			<td>
				See https://www.reddit.com/r/dataisbeautiful/comments/101hvnv/oc_i_tracked_every_hour_of_my_life_for_5_years/<br>
				This kind of 24h visualization is quite nice - https://preview.redd.it/2657fm8lxn9a1.png?width=2387&format=png&auto=webp&s=5a5411232b151320838ef24083bada5003fda31a<br>
				We should implement something like that
			</td>
		</tr>
		<tr>
			<td>Add export to JSON</td>
			<td>3</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/jakeangus">jakeangus</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/154">#154</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/184">#184</a></td>
			<td>Yes</td>
			<td>
				Currently, data export to CSV and TSV is supported.<br>
				Adding JSON support would be great too
			</td>
		</tr>
		<tr>
			<td>Make event ghosting smarter</td>
			<td>5</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/153">#153</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/182">#182</a></td>
			<td>Yes</td>
			<td>
				See https://github.com/maxpatiiuk/calendar-plus/pull/102#discussion_r1009769566<br>
				Define the ghost events using event names rather than even IDs
			</td>
		</tr>
		<tr>
			<td>Doughnut chart labels are incorrect</td>
			<td>3</td>
			<td>🏔 High</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/183">#183</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/182">#182</a></td>
			<td>Yes</td>
			<td>When you have several calendars and virtual calendars, the labels on the doughnut chart seem to be off by one (calendars seem to get the label from virtual calendars)</td>
		</tr>
	</tbody>
</table>

## Sprint #7

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Story Points</th>
			<th>Priority</th>
			<th>Assignee</th>
			<th>GitHub Issue</th>
			<th>Completed</th>
			<th>Pull Request</th>
			<th>Merged</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Validate RegExp</td>
			<td>2</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/126">#126</a></td>
			<td>Yes</td>
			<td></td>
			<td>Yes</td>
			<td>When adding an "Autocomplete Prediction" using "Regex" matcher, validate the entered regular expression for validity</td>
		</tr>
		<tr>
			<td>Auto calendar switcher should not try to switch calendar if correct calendar is already selected</td>
			<td>3</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/121">#121</a></td>
			<td>Yes</td>
			<td></td>
			<td>Yes</td>
			<td>When creating a new event, if you selected calendar "A", and then the event name matched calendar "A" based on the autocomplete predictions rule, the extension tries to select calendar "A" once again, rather than detects that the calendar is already selected</td>
		</tr>
		<tr>
			<td>Fetch repeated events more efficiently</td>
			<td>8</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/148">#148</a></td>
			<td>Yes</td>
			<td></td>
			<td>Yes</td>
			<td>
				When fetching events, call with singleEvents: true (see https://developers.google.com/calendar/api/v3/reference/events/list)<br>
				This way, instead of sending each instance of a repeated event, Google Calendar will send the rules on how the event repeats<br>
				This will potentially reduce the response size by a lot when fetching over large periods (i.e, a year)
			</td>
		</tr>
		<tr>
			<td>Ability to supress "Edit recurring event" dialog</td>
			<td>8</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/128">#128</a></td>
			<td>Yes</td>
			<td></td>
			<td>Yes</td>
			<td>
				When making edits to repeated events, an "Edit recurring event" dialog pops up.<br>
				Most of the time you want to only edit the current instance of the event, not all repeated events.<br>
				Thus, it would be great if you could suppress that dialog, unless the user is holding a special key (i.e, shift)
			</td>
		</tr>
		<tr>
			<td>Handle pagination when fetching events</td>
			<td>5</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/149">#149</a></td>
			<td>Yes</td>
			<td></td>
			<td>Yes</td>
			<td>
				Events fetch endpoint (https://developers.google.com/calendar/api/v3/reference/events/list) returns 2500 results max<br>
				This is not enough when fetching events for entire year (or even for a month in case of power users)<br>
				The API provides pagination, but the code does not yet look beyond the first page - need to fix that
			</td>
		</tr>
		<tr>
			<td>Improve Caching Strategy</td>
			<td>5</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/82">#82</a></td>
			<td>Yes</td>
			<td></td>
			<td>Yes</td>
			<td>
				A cache layer was added for computed event durations<br>
				However, we need to make caching smarter. For one, caching must be disabled for events in the future, as future events are likely to change (perhaps, the stale-while-refresh strategy could be used)<br>
				Also, there should be button to explicitly recompute the durations for current view (day, week or month)<br>
				Ideally, we should detect which events changed and recompute only those, but that is a bit out of scope at the moment due to complexity involved
			</td>
		</tr>
		<tr>
			<td>Allow hiding dangerous "Edit All" option</td>
			<td>2</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/160">#160</a></td>
			<td>Yes</td>
			<td></td>
			<td>Yes</td>
			<td></td>
		</tr>
		<tr>
			<td>Fetch events for current year</td>
			<td>13</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/90">#90</a></td>
			<td>Yes</td>
			<td></td>
			<td>Yes</td>
			<td>There are some unique challanges involved in fetching events for entire year</td>
		</tr>
		<tr>
			<td>Make stacked area chart work when in year view</td>
			<td>5</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/91">#91</a></td>
			<td>Yes</td>
			<td></td>
			<td>Yes</td>
			<td>Need to group data by month, rather than show each day as a separate column</td>
		</tr>
	</tbody>
</table>

## Sprint #6

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Story Points</th>
			<th>Priority</th>
			<th>Assignee</th>
			<th>GitHub Issue</th>
			<th>Completed</th>
			<th>Pull Request</th>
			<th>Merged</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Allow defining calendar name shortcuts</td>
			<td>5</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/122">#122</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/135">#135</a></td>
			<td>Yes</td>
			<td>Add a UI for defining shorter names for calendars. Shorter versions should be accepted by future components, and is to be treated as a synonym - to speed up data entry</td>
		</tr>
		<tr>
			<td>Support using calendar name shortcuts in event names</td>
			<td>3</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/123">#123</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/135">#135</a></td>
			<td>Yes</td>
			<td>Need to support a syntax like this for event names: synonym: eventName. If user is creating an event by that name, and synonym, matches a defined calendar synonym, it should automatically switch to corresponding calendar and remove the synonym: part from the event name</td>
		</tr>
		<tr>
			<td>Charts is double or tripple counting the durations</td>
			<td>5</td>
			<td>🏔 High</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/134">#134</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/142">#142</a></td>
			<td>Yes</td>
			<td>Seems like every time you open the chart, the total durations increase. See https://github.com/maxpatiiuk/calendar-plus/issues/134</td>
		</tr>
		<tr>
			<td>Fix test depending on Daylight Savings Time</td>
			<td>3</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/114">#114</a></td>
			<td>Yes</td>
			<td></td>
			<td>Yes</td>
			<td>
				The test in /src/src/tests/tests/globalSetup.test.ts depends on whether or not we are currently observing daylight savings time.<br>
				This test should be resistant to changes in daylight savings time while still in the same location
			</td>
		</tr>
		<tr>
			<td>Add a button to UI to refetch events for current view</td>
			<td>3</td>
			<td>🏔 High</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/125">#125</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/142">#142</a></td>
			<td>Yes</td>
			<td>There should be button to explicitly recompute the durations for current view (day, week or month)` into a separate issue</td>
		</tr>
	</tbody>
</table>

## Sprint #5

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Story Points</th>
			<th>Priority</th>
			<th>Assignee</th>
			<th>GitHub Issue</th>
			<th>Completed</th>
			<th>Pull Request</th>
			<th>Merged</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Disable animations if user indicated so in system settings</td>
			<td>3</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/jetsemr">jetsemr</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/89">#89</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/141">#141</a></td>
			<td>Yes</td>
			<td>This will improve user experience and enhance accessibility compliance</td>
		</tr>
		<tr>
			<td>Make Doughnut Chart factor in virtual calendars</td>
			<td>8</td>
			<td>🏔 High</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/116">#116</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/119">#119</a></td>
			<td>Yes</td>
			<td>Virtual calendars can be defined now. Next, need to make Doughnut Chart display the virtual calendars</td>
		</tr>
		<tr>
			<td>Add support for "customday" view</td>
			<td>5</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/61">#61</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/132">#132</a></td>
			<td>Yes</td>
			<td>
				Google Calendar has one user-customizable view that can be set to display X days at once. The extension should detect the preferences for that view.<br>
				Currently, the "Calendar Plus" button just disappears when "customday" view is selected
			</td>
		</tr>
		<tr>
			<td>Add an option to ignore all-day events</td>
			<td>3</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/105">#105</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/119">#119</a></td>
			<td>Yes</td>
			<td>
				Currently, an all-day event is treated as an event that spans entire days, and thus contributes 24 hours to the plots.<br>
				However, this can easily skew the statistics.<br>
				There should be an option to ignore all-day events when plotting the events.<br>
				Note, changing the value of this pref would require wiping the events cache
			</td>
		</tr>
		<tr>
			<td>Add a keyboard shortcut to open the overlay</td>
			<td>2</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/Durbatuluk1701">Durbatuluk1701</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/106">#106</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/115">#115</a></td>
			<td>Yes</td>
			<td>This would be useful for power users who would save a lot of time with a keyboard shortcut rather than have to use the mouse to open the overlay</td>
		</tr>
		<tr>
			<td>Make keyboard shorctut that opens the overlay customizable</td>
			<td>5</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/107">#107</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/130">#130</a></td>
			<td>Yes</td>
			<td>Once a keyboard shortcut is added, it needs to be customizable to improve usability and to be compliant with the accessibility standards</td>
		</tr>
	</tbody>
</table>

## Sprint #4

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Story Points</th>
			<th>Priority</th>
			<th>Assignee</th>
			<th>GitHub Issue</th>
			<th>Completed</th>
			<th>Pull Request</th>
			<th>Merged</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Record the voiceover for the demo video</td>
			<td>5</td>
			<td>🌋 Urgent</td>
			<td><a href="https://github.com/jakeangus">jakeangus</a></td>
			<td></td>
			<td>Yes</td>
			<td></td>
			<td>Yes</td>
			<td></td>
		</tr>
		<tr>
			<td>Edit the demo video</td>
			<td>5</td>
			<td>🌋 Urgent</td>
			<td><a href="https://github.com/jakeangus">jakeangus</a></td>
			<td></td>
			<td>Yes</td>
			<td></td>
			<td>Yes</td>
			<td></td>
		</tr>
		<tr>
			<td>Add user preferences menu</td>
			<td>5</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/99">#99</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/102">#102</a></td>
			<td>Yes</td>
			<td>For UI and behavior customization. Also, would improve accessibility</td>
		</tr>
		<tr>
			<td>Add a way to "ghost" an event</td>
			<td>3</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/100">#100</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/102">#102</a></td>
			<td>Yes</td>
			<td>
				Need to add a keyboard shortcut for marking an event as "ghosted".<br>
				Ghosted events are rendered as semi-transparent and are not interactive (thus preventing accidental clicks)
			</td>
		</tr>
		<tr>
			<td>Add a way to customize the "ghost event" shortcut</td>
			<td>2</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/99">#99</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/102">#102</a></td>
			<td>Yes</td>
			<td></td>
		</tr>
		<tr>
			<td>Add UI for defining virtual calendars and autocomplete rules</td>
			<td>3</td>
			<td>🏔 High</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/86">#86</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/102">#102</a></td>
			<td>Yes</td>
			<td>Let user set rules that determine how to subdivide a calendar (i.e, create a virtual calendar for all events in "KU Homework" calendar that begin with "EECS 665")</td>
		</tr>
		<tr>
			<td>Add autocomplete when user is creating a new event</td>
			<td>5</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/87">#87</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/104">#104</a></td>
			<td>Yes</td>
			<td>This is useful for power users who are creating a lot of events</td>
		</tr>
		<tr>
			<td>Automatically switch to correct calendar when creating a calendar event</td>
			<td>5</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/88">#88</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/104">#104</a></td>
			<td>Yes</td>
			<td>Automatically put the newly created event into a correct calendar based on the event name</td>
		</tr>
	</tbody>
</table>

## Sprint #3

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Story Points</th>
			<th>Priority</th>
			<th>Assignee</th>
			<th>GitHub Issue</th>
			<th>Completed</th>
			<th>Pull Request</th>
			<th>Merged</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Overlay closes when changing view mode</td>
			<td>3</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/Durbatuluk1701">Durbatuluk1701</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/58">#58</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/113">#113</a></td>
			<td>Yes</td>
			<td>- When the view mode is changed, the overlay closes and is no longer visible</td>
		</tr>
		<tr>
			<td>Make the widget grid customizable</td>
			<td>5</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/71">#71</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/85">#85</a></td>
			<td>Yes</td>
			<td>Allow changing the size of each widge, removing widgets and adding widgets. Make sure everything is keyboard accessible and screen reader accessible</td>
		</tr>
		<tr>
			<td>Display a stacked area chart</td>
			<td>13</td>
			<td>🏔 High</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/72">#72</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/83">#83</a></td>
			<td>Yes</td>
			<td>Display a stacked area chart in a widget when in week view. The chart should show the daily time spent on events from each calendar</td>
		</tr>
		<tr>
			<td>Make stacked area chart work when in day view</td>
			<td>2</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/72">#72</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/83">#83</a></td>
			<td>Yes</td>
			<td>Display a stacked area chart in a widget when in week view. The chart should show the daily time spent on events from each calendar</td>
		</tr>
		<tr>
			<td>Make stacked area chart work when in month view</td>
			<td>8</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/72">#72</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/83">#83</a></td>
			<td>Yes</td>
			<td>Display a stacked area chart in a widget when in week view. The chart should show the daily time spent on events from each calend</td>
		</tr>
		<tr>
			<td>Add a doughnut chart</td>
			<td>5</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/83">#83</a></td>
			<td>Yes</td>
			<td>For easily summarizing the total number of hours spent on a task in a given period</td>
		</tr>
		<tr>
			<td>Add Code Coverage Reports</td>
			<td>3</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/jetsemr">jetsemr</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/11">#11</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/94">#94</a></td>
			<td>No</td>
			<td>Add a github-bot that comments the current code coverage percentage on each Pull Request</td>
		</tr>
		<tr>
			<td>Allow exporting data</td>
			<td>2</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/jakeangus">jakeangus</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/73">#73</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/93">#93</a></td>
			<td>Yes</td>
			<td>Allow exporting data from the stacked area chart as a JSON or CSV</td>
		</tr>
		<tr>
			<td>Add ability to set goals</td>
			<td>5</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/74">#74</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/92">#92</a></td>
			<td>Yes</td>
			<td>Add ability to set, edit and remove goals for total number of hours of events in a given calendar. Goals should be synced with Google Extension Storage API</td>
		</tr>
		<tr>
			<td>Calculate progress towards goals</td>
			<td>2</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/75">#75</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/92">#92</a></td>
			<td>Yes</td>
			<td>Calculate the current progress toward each goal the user set</td>
		</tr>
		<tr>
			<td>Add a badge for showing progress towards each goal</td>
			<td>2</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/77">#77</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/92">#92</a></td>
			<td>Yes</td>
			<td>Display the progress toward each goal in a widget in the dashboard</td>
		</tr>
		<tr>
			<td>Record the footage for the demo video</td>
			<td>3</td>
			<td>🌋 Urgent</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td></td>
			<td>Yes</td>
			<td></td>
			<td>Yes</td>
			<td></td>
		</tr>
	</tbody>
</table>

## Sprint #2

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Story Points</th>
			<th>Priority</th>
			<th>Assignee</th>
			<th>GitHub Issue</th>
			<th>Completed</th>
			<th>Pull Request</th>
			<th>Merged</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Integrate with TSDoc</td>
			<td>2</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/jetsemr">jetsemr</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/10">#10</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/65">#65</a></td>
			<td>Yes</td>
			<td>To generate human-friendly documentation</td>
		</tr>
		<tr>
			<td>Add a cache layer on top of Storage API</td>
			<td>5</td>
			<td>🏔 High</td>
			<td><a href="https://github.com/Durbatuluk1701">Durbatuluk1701</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/9">#9</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/80">#80</a></td>
			<td>Yes</td>
			<td>
				Integrating with Google Drive API won't be needed.<br>
				But, we will need a cache layer to save the computed summary of how much time the user spent on a particular event in a given week
			</td>
		</tr>
		<tr>
			<td>Calendar Plus Button not Appearing on Landing Page </td>
			<td>2</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/Durbatuluk1701">Durbatuluk1701</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/40">#40</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/78">#78</a></td>
			<td>Yes</td>
			<td>The button to launch the Calendar Plus overlay does not appear on the default landing page</td>
		</tr>
		<tr>
			<td>Listen for extension icon click</td>
			<td>3</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/jakeangus">jakeangus</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/42">#42</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/79">#79</a></td>
			<td>Yes</td>
			<td>
				When user click on our extension in the list of extensions some action should happen.<br>
				Could possibly switch to the calendar tab, or open a new page
			</td>
		</tr>
		<tr>
			<td>Look for useful manifest.json and service_worker commands</td>
			<td>3</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/43">#43</a></td>
			<td>Yes</td>
			<td></td>
			<td>Yes</td>
			<td>
				Look over the Manifest v3 spec in search of useful metadata options and commands we could add to our extension<br>
				Look over service_worker commands and chrome extensions APIs for the list of possible actions and events
			</td>
		</tr>
		<tr>
			<td>Sync the list of visible calendars</td>
			<td>5</td>
			<td>🏔 High</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/45">#45</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/62">#62</a></td>
			<td>Yes</td>
			<td>
				Users can enable/disable calendars by clicking on them on the sidebar. The plugin should intercept that action somehow to keep the list of visible calendars synchronized.
			</td>
		</tr>
		<tr>
			<td>Add documentation for getting React DevTools to work</td>
			<td>3</td>
			<td>🏔 High</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/46">#46</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/53">#53</a></td>
			<td>Yes</td>
			<td>
				React DevTools Extension does not work for debugging Chrome Extension out of the box.<br>
				You have to do special steps. Need to add information about that to the documentation
			</td>
		</tr>
		<tr>
			<td>Make reloading extension easier</td>
			<td>3</td>
			<td>🏔 High</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/54">#54</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/55">#55</a></td>
			<td>Yes</td>
			<td>
				After each webpack rebuild, you need to go to the "Extensions" page in Google Chrome and press the "Update" button to reload the extension and see the newest changes.<br>
				There should be a an easier way
			</td>
		</tr>
		<tr>
			<td>Fetch events for current day</td>
			<td>3</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/41">#41</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/67">#67</a></td>
			<td>Yes</td>
			<td>
				- Standard data objects to an event object<br>
				- Retrieve events for specific timeframe<br>
				- Display events on user interface
			</td>
		</tr>
		<tr>
			<td>Fetch events for current week</td>
			<td>5</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/41">#41</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/67">#67</a></td>
			<td>Yes</td>
			<td></td>
		</tr>
		<tr>
			<td>Fetch events for current month</td>
			<td>8</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/41">#41</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/67">#67</a></td>
			<td>Yes</td>
			<td></td>
		</tr>
	</tbody>
</table>

## Sprint #1

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Story Points</th>
			<th>Priority</th>
			<th>Assignee</th>
			<th>GitHub Issue</th>
			<th>Completed</th>
			<th>Pull Request</th>
			<th>Merged</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Add initial boilerplate code for a React/TypeScript/Tailwind project with Jest</td>
			<td>3</td>
			<td>🌋 Urgent</td>
			<td><a href="https://github.com/Durbatuluk1701">Durbatuluk1701</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/3">#3</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/1">#1</a> and <a href="https://github.com/maxpatiiuk/calendar-plus/pull/2">#2</a></td>
			<td>Yes</td>
			<td>
				- The code repository should be accessible via GitHub<br>
				- The repository should have a correctly configured package.json so that npm install automatically installs necessary dependencies<br>
				- The repositories code should compile without errors
			</td>
		</tr>
		<tr>
			<td>Add and populate the manifest.json file to make the project be recognized as a Chrome Extension</td>
			<td>2</td>
			<td>🌋 Urgent</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/4">#4</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/2">#2</a></td>
			<td>Yes</td>
			<td>
				- The manifest.json file should include necessary project information to for the package to be recognized as a Chrome extension<br>
				- The project should be configured to build files into a webpacked bundle of javascript code
			</td>
		</tr>
		<tr>
			<td>Make extension add a button to the Google Calendar page</td>
			<td>3</td>
			<td>🌋 Urgent</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/5">#5</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/27">#27</a></td>
			<td>Yes</td>
			<td>
				- When a user launches Google calendar while the extension is installed, a placeholder button should appear on the page<br>
				- This button does not necessarily do anything, but should appear in a way that is not detrimental to normal GCal user experience
			</td>
		</tr>
		<tr>
			<td>Display a full-page overlay, or a modal dialog when a button is pressed</td>
			<td>3</td>
			<td>🌋 Urgent</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/6">#6</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/27">#27</a></td>
			<td>Yes</td>
			<td>
				- When the button from requirement 3 is pressed, a dialog or modal will appear<br>
				- The dialog/modal should disappear if it is clicked off of or closed<br>
				- The dialog/modal does not need to explicitly say anything just must appear and be closable
			</td>
		</tr>
		<tr>
			<td>Render a grid of blank widgets for the future plugins</td>
			<td>1</td>
			<td>🏕 Medium</td>
			<td><a href="https://github.com/Durbatuluk1701">Durbatuluk1701</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/7">#7</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/34">#34</a></td>
			<td>Yes</td>
			<td>
				- There should be a dashboard page with blank widget slots<br>
				- The widget slots should be reasonably sized similar to those outlined in the Figma model in the Initial Architecture document<br>
				- Widgets should be flexible enough to hold a generic component, but just a placeholder for now
			</td>
		</tr>
		<tr>
			<td>Add a day/week/month/year selection option to the header of the overlay. Changing the view mode should also change the view mode in the Google Calendar behind the extension</td>
			<td>3</td>
			<td>🌋 Urgent</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/29">#29</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/36">#36</a></td>
			<td>Yes</td>
			<td>
				- The full page overlay references in #4 should have headers with the outlined options displayed<br>
				- There should be a button to toggle the view mode that will also toggle the GCal view mode behind the modal
			</td>
		</tr>
		<tr>
			<td>Add a button to go to next/previous week. Also, support N and P keyboard shortcuts (which are already used by Google Calendar). Make sure the week displayed in the extension and in Google Calendar is synchronized</td>
			<td>3</td>
			<td>🌋 Urgent</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/29">#29</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/36">#36</a></td>
			<td>Yes</td>
			<td>
				- The overlay should add buttons for week traversal<br>
				- Add keyboard support for week traversal by the N and P keys<br>
				- Ensure synchronization with the GCal behind overlay
			</td>
		</tr>
		<tr>
			<td>Copy the name of current week/month/year from the Google Calendar header to the header of our overlay and make sure it stays in sync on changes to view mode or when going to next/previous week</td>
			<td>3</td>
			<td>🏝 Low</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/29">#29</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/36">#36</a></td>
			<td>Yes</td>
			<td>
				- The overlay header should show the date<br>
				- The date should stay the same when moving to next or previous week
			</td>
		</tr>
		<tr>
			<td>Add an oAuth integration so that the extension can get access to Google APIs on user's behalf</td>
			<td>8</td>
			<td>🏔 High</td>
			<td><a href="https://github.com/maxpatiiuk">maxpatiiuk</a></td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/issues/8">#8</a></td>
			<td>Yes</td>
			<td><a href="https://github.com/maxpatiiuk/calendar-plus/pull/44">#44</a></td>
			<td>Yes</td>
			<td>
				- The user should be able to login with an existing google account<br>
				- Credentials should be used to access Google Calendar API
			</td>
		</tr>
	</tbody>
</table>
