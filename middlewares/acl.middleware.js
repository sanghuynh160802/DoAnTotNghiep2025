const acl = require('acl');

const aclInstance = new acl(new acl.memoryBackend());

aclInstance.allow([
	{
	  roles: 'admin',
	  allows: [
		{ resources: '/users', permissions: '*' },
		{ resources: '/users/:id', permissions: '*' },
		{ resources: '/users/me', permissions: '*' },
		{ resources: '/', permissions: '*' },
	  ],
	},
	{
	  roles: 'user',
	  allows: [
		{ resources: '/users/me', permissions: ['get', 'post', 'put'] },
		{ resources: '/', permissions: ['get', 'post'] },
		{ resources: '/users/:id', permissions: ['get', 'put'] },
	  ],
	}
  ]);  

module.exports = aclInstance;
