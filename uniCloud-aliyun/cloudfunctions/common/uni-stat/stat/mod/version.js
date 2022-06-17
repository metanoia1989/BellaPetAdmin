/**
 * @class Version 应用版本模型
 */
const BaseMod = require('./base')
const {
	DateTime
} = require('../lib')
module.exports = class Version extends BaseMod {
	constructor() {
		super()
		this.tableName = 'app-versions'
	}

	/**
	 * 获取版本信息
	 * @param {String} appid DCloud-appid
	 * @param {String} platformId 平台编号
	 * @param {String} appVersion 平台版本号
	 */
	async getVersion(appid, platformId, appVersion) {
		const cacheKey = 'uni-stat-version-' + appid + '-' + platformId + '-' + appVersion
		let versionData = await this.getCache(cacheKey)
		if (!versionData) {
			const versionInfo = await this.getCollection(this.tableName).where({
				appid: appid,
				platform_id: platformId,
				version: appVersion
			}).limit(1).get()
			versionData = []
			if (versionInfo.data.length > 0) {
				versionData = versionInfo.data[0]
				await this.setCache(cacheKey, versionData)
			}
		}
		return versionData
	}

	/**
	 * 获取版本信息没有则进行创建
	 * @param {String} appid DCloud-appid
	 * @param {String} platformId 平台编号
	 * @param {String} appVersion 平台版本号
	 */
	async getVersionAndCreate(appid, platformId, appVersion) {
		const versionInfo = await this.getVersion(appid, platformId, appVersion)
		if (versionInfo.length === 0) {
			if (appVersion.length > 0 && !appVersion.includes('}')) {
				const thisTime = new DateTime().getTime()
				const insertParam = {
					appid: appid,
					platform_id: platformId,
					version: appVersion,
					create_time: thisTime,
					update_time: thisTime
				}
				const res = await this.insert(this.tableName, insertParam)
				if (res && res.id) {
					return Object.assign(insertParam, {
						_id: res.id
					})
				}
			}
		}
		return versionInfo
	}
}
