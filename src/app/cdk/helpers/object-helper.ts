export class ObjectHelper {

	static extendObject(dest: any, ...sources: any[]): any {
		if (dest == null) {
			throw TypeError('Cannot convert undefined or null to object');
		}

		for (let source of sources) {
			if (source != null) {
				for (let key in source) {
					if (source.hasOwnProperty(key)) {
						dest[key] = source[key];
					}
				}
			}
		}

		return dest;
	}

}
