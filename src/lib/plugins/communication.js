module.exports.server=function(serv)
{
  serv._writeAll= (packetName, packetFields) =>
    serv.players.forEach((player) => player._client.write(packetName, packetFields));

  serv._writeArray= (packetName, packetFields, players) =>
    players.forEach((player) =>player._client.write(packetName, packetFields));

  serv._writeNearby= (packetName, packetFields, loc) =>
    serv._writeArray(packetName, packetFields, serv.getNearby(loc));

  serv.getNearby= ({world,position,radius=8*16*32}) => serv.players.filter( player =>
    player.world == world &&
    player.position.distanceTo(position) <= radius
  );

  serv.getNearbyEntities= ({world,position,radius=8*16*32}) => Object.keys(serv.entities)
    .map(eId => serv.entities[eId])
    .filter(entity =>
      entity.world == world &&
      entity.position.distanceTo(position) <= radius
    );
};

module.exports.player=function(player,serv)
{
  player._writeOthers= (packetName, packetFields) =>
    player
      .getOthers()
      .forEach((otherPlayer) => otherPlayer._client.write(packetName, packetFields));

  player._writeOthersNearby = (packetName, packetFields) =>
    serv._writeArray(packetName, packetFields, player.nearbyPlayers());

  player.getOthers = () => serv.players.filter((otherPlayer) => otherPlayer != player);

  player.getNearbyPlayers = (radius=player.viewDistance*32) => serv.getNearby({
    world: player.world,
    position: player.position,
    radius: radius
  });

  player.nearbyPlayers = (radius=player.viewDistance*32) => player.nearbyEntities
    .filter(e => e.type == 'player');
};