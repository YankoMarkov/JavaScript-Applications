let service = (() => {
	
	function saveReceiptId(receiptId) {
		sessionStorage.setItem('receiptId', receiptId);
	}
	
	function getReceipt(userId) {
		let url = `receipts?query={"_acl.creator":"${userId}","active":"true"}`;
		return remote.get('appdata', url);
	}
	
	function createReceipt() {
		let data = {
			active: true,
			productCount: 0,
			total: 0
		};
		return remote.post('appdata', 'receipts', data);
	}
	
	function addEntry(type, qty, price, receiptId) {
		let data = {type, qty, price, receiptId};
		return remote.post('appdata', 'entries', data);
	}
	
	function deleteEntry(entryId) {
		let url = `entries/${entryId}`;
		return remote.remove('appdata', url);
	}
	
	function getEntriesByReceiptId(receiptId) {
		let url = `entries?query={"receiptId":"${receiptId}"}`;
		return remote.get('appdata', url);
	}
	
	function getMyReceipts(userId) {
		let url = `receipts?query={"_acl.creator":"${userId}","active":"false"}`;
		return remote.get('appdata', url);
	}
	
	function receiptDetails(receiptId) {
		let url = `receipts/${receiptId}`;
		return remote.get('appdata', url);
	}
	
	function commitReceipt(receiptId, productCount, total) {
		let data = {
			active: false,
			productCount,
			total
		};
		let url = `receipts/${receiptId}`;
		return remote.update('appdata', url, data);
	}
	
	return {
		getReceipt,
		createReceipt,
		addEntry,
		deleteEntry,
		getEntriesByReceiptId,
		getMyReceipts,
		receiptDetails,
		commitReceipt,
		saveReceiptId
	}
})();