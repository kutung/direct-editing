define(['customer/Config'], function actorLoader(customerConfig) {
    var actorRoleMapping = customerConfig.get('actorRoleMapping');

    function Actor() {}

    Actor.prototype.getValidActor = function getValidActor(currentActor) {
        var actorKey, actor;

        for (actorKey in actorRoleMapping) {
            if (actorRoleMapping.hasOwnProperty(actorKey) === true) {
                actor = actorRoleMapping[actorKey];
                if (actor.indexOf(currentActor.toLowerCase()) !== -1) {
                    return actorKey;
                }
            }
        }
        return null;
    };

    return Actor;
});
