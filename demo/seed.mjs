export function createSeed(seedDate = '2026-10-17') {
  // Organization identity and rounded public channel counters transcribed from
  // the Atlas Nexus P2P Labs workspace on 2026-10-17. Campaign and video records
  // below remain demo fixtures; they are not live campaign or video analytics.
  const organizations = [
    { id: 'org-orbit', name: 'PT Sorak Digital Media', brandName: 'P2P Labs', city: null, status: 'Active', partnerCount: 3, channelCount: 40, activeContracts: 10, mappedChannels: 40, unmappedChannels: 0, archivedChannels: 0, contentOwners: 0, sourceUrl: 'https://atlasnexus.app/app/organizations/2d73aa03-46a4-4a53-b23d-6ea96b913bac' },
  ];
  const networks = [
    { id: 'network-orbit-studio', organizationId: 'org-orbit', name: 'P2P Labs', channelCount: 37 },
    { id: 'network-orbit-select', organizationId: 'org-orbit', name: 'MEA', channelCount: 3 },
    { id: 'network-northstar', organizationId: 'org-orbit', name: 'Haluan Digital Agency', channelCount: 0 },
  ];
  // Channel titles, partner names, subscribers and lifetime views reflect all
  // rows of the live organization channel list. Counts shown as K/M on
  // that page are rounded; video evidence generated below is explicitly sample.
  const creatorData = [
    ['creator-maya', 'Fetty Bismo Channel', null, 'General creator content', 1900, 679000, null, 'Public channel profile in the P2P Labs network. Review recent videos to confirm topic fit.', 'Indonesian', 'Long-form · Shorts', 'channel-maya', 'network-orbit-studio'],
    ['creator-ruang', 'Fayyy2199', null, 'General creator content', 673, 220300, null, 'Public channel profile in the P2P Labs network. Review recent videos to confirm topic fit.', 'Indonesian', 'Long-form', 'channel-ruang', 'network-orbit-studio'],
    ['creator-nara', 'Aulia Dita Pratiwi', null, 'General creator content', 41, 26100, null, 'Public channel profile in the P2P Labs network. Review recent videos to confirm topic fit.', 'Indonesian', 'Long-form · Shorts', 'channel-nara', 'network-orbit-studio'],
    ['creator-arunika', 'Bossdikha', null, 'General creator content', 63, 28900, null, 'Public channel profile in the P2P Labs network. Review recent videos to confirm topic fit.', 'Indonesian', 'Long-form', 'channel-arunika', 'network-orbit-studio'],
    ['creator-bima', 'Astry_id', null, 'General creator content', 356, 4300000, null, 'Public channel profile in the P2P Labs network. Review recent videos to confirm topic fit.', 'Indonesian', 'Long-form · Shorts', 'channel-bima', 'network-orbit-studio'],
    ['creator-senja', 'Mas Aldi', null, 'General creator content', 1200, 4300000, null, 'Public channel profile in the P2P Labs network. Review recent videos to confirm topic fit.', 'Indonesian', 'Long-form', 'channel-senja', 'network-orbit-studio'],
    ['creator-kin', 'Sini Gua Spill Gadget', null, 'Technology', 8, 4300, null, 'Channel name indicates gadget content; validate topic fit against its current public videos.', 'Indonesian', 'Shorts · Long-form', 'channel-kin', 'network-orbit-studio'],
    ['creator-loka', 'Sole Story', null, 'General creator content', 5, 1300, null, 'Public channel profile in the P2P Labs network. Review recent videos to confirm topic fit.', 'Indonesian', 'Long-form', 'channel-loka', 'network-orbit-studio'],
  ];
  const creators = creatorData.map(([id, name, handle, niche, subscribers, totalViews, engagementRate, description, languages, formats, channelId, networkId]) => ({ id, name, handle, niche, subscribers, avgViews: Math.max(1, Math.round(totalViews / 70)), engagementRate, description, languages, formats, channelId, networkId }));
  const channelSnapshots = [
    ['f93e857d-ff1f-402d-a2f4-833c617a14f8', 'Lucyyy', 'P2P Labs', 3, 2800],
    ['0bd52e47-86a1-4652-aac6-8b1625904b11', 'Biar Wangi', 'P2P Labs', 6, 2000],
    ['5e053938-c425-4771-a0b1-399fc5c76511', 'Sole Story', 'P2P Labs', 5, 1300],
    ['873da40f-8eb7-49fa-a607-aa3ed0c5ce57', 'Sini Gua Spill Gadget', 'P2P Labs', 8, 4300],
    ['f82c1cef-ff6d-47ec-8e36-72851443386c', 'Fetty Bismo Channel', 'P2P Labs', 1900, 679000],
    ['28706159-ab81-4e0f-a1c3-1a15104a0e68', 'Fayyy2199', 'P2P Labs', 673, 220300],
    ['fb1bfe63-e1f6-44ea-b681-b2a99985bc2a', 'Aulia Dita Pratiwi', 'P2P Labs', 41, 26100],
    ['f8d40625-49b3-4c32-9f25-10c7327231a5', 'Bossdikha', 'P2P Labs', 63, 28900],
    ['44e602bb-aa3b-4669-a19c-07c61db5bfc5', 'Astry_id', 'P2P Labs', 356, 4300000],
    ['03090e41-5790-46a4-ac44-0b899169cbd8', 'Mas Aldi', 'P2P Labs', 1200, 4300000],
    ['338d046c-0230-4503-8e3d-c81af2c9c6fd', 'Daddy_RizkyJihan', 'P2P Labs', 170, 33700],
    ['b383e874-0616-4fec-8a34-e51315c7ccc0', 'Ivan s', 'P2P Labs', 2500, 4100000],
    ['10872a71-46ea-47e8-a8cd-e269b250cf8c', 'Rivia Riswandini', 'P2P Labs', 388, 4200000],
    ['eb881cad-c320-4dbb-834e-994eab1fad70', 'Yae', 'P2P Labs', 291, 3600000],
    ['46083332-ab4e-4606-8fb7-38bdab99538e', 'Rumahcivi', 'P2P Labs', 439, 2100000],
    ['fbc8ab48-78dc-4f33-bc99-06a5b2d56573', 'Mochamad Rizki Gufron', 'P2P Labs', 1, 1700],
    ['4c502ec7-754d-4f3c-92a9-b6fea522504b', 'Seen on Pink', 'P2P Labs', 170, 188100],
    ['ed8b640a-1c75-4d23-9fb7-c0af9a0bff6f', 'dr. Kevin Mak', 'P2P Labs', 71900, 55600000],
    ['75eb71c5-1908-4de3-98ae-f1a688fcc83f', 'Karenhendrawan si Nak Sulawesi', 'P2P Labs', 273, 12000],
    ['49a148a6-5244-4147-bd64-01b982c4c2e2', 'КиноРазбор | King Recap', 'P2P Labs', 9500, 6000000],
    ['1dbe1d74-dba6-43ae-9ac9-7e74be7e05f2', 'Kerajaan Glowing 👑', 'P2P Labs', 3100, 54300],
    ['5291bfaf-07d3-4751-8bbe-f3cbe8176398', 'Siap Belanja Gadget', 'P2P Labs', 392, 51900],
    ['8ade6c66-7c01-4017-a279-f8bb242fff6e', 'Meydy Chairany', 'P2P Labs', 35, 23600],
    ['a874780d-318a-49f9-8db9-843083d03d9d', 'ex anggaaa', 'P2P Labs', 171, 99300],
    ['15c890ac-d7af-4189-ab97-5fa82a53e8f9', 'SefricoTechno', 'P2P Labs', 75, 104200],
    ['80f3ee72-8ada-444b-a059-98c0cc9d70ec', 'Mommy Derasti', 'P2P Labs', 27, 29800],
    ['444d13e5-e671-452d-91cc-bf3ac82a957d', 'marvin vondawati', 'P2P Labs', 98, 46600],
    ['53fd8bae-9dce-4e97-a0a8-0788df7ad79f', 'ahmad najib', 'P2P Labs', 36, 39100],
    ['0b0d466f-fb16-48d2-81f3-7b109721398f', 'Kenyorindra', 'P2P Labs', 223, 32500],
    ['dfe26424-7bdf-4bc8-a584-9bf92be8b556', 'Margareta Wijaya', 'P2P Labs', 3000, 429700],
    ['3717fd75-b59a-49eb-9f89-61d39dc5d38c', 'Vanda Rainy', 'P2P Labs', 5100, 999800],
    ['d7b57eaa-7317-4af0-a8bc-dc4a30559cba', 'Miss.Konten', 'MEA', 9100, 3900000],
    ['c6a450e6-9d7e-4bec-917a-c04a2a99e50c', 'KOH DENNIES', 'MEA', 876, 747600],
    ['263b61ac-45cf-43e4-852b-7cd92e4e3f53', 'The Cozy Things', 'MEA', 256, 531200],
    ['196f8f2e-f4ed-4617-bce0-2406f5c47916', 'shelly V', 'P2P Labs', 829, 1400000],
    ['166742c2-2d3c-428f-9d9b-f77893ee7e91', 'Rachella.Pamela', 'P2P Labs', 10900, 3800000],
    ['c683be1c-7e32-40d6-9c58-7695227a1368', 'Deasi Listiani', 'P2P Labs', 1500000, 1600000000],
    ['8c41a32e-870e-48ba-93ea-9a84b63bf9dd', 'Jessica Jehaa', 'P2P Labs', 511000, 127700000],
    ['a76329b6-e57b-4815-abe2-b420e70feec4', 'Asa Living', 'P2P Labs', 25300, 12600000],
    ['57318d49-38f0-4b0e-979c-d8c52e07f3dd', 'Louisse Scarlett Family', 'P2P Labs', 2100000, 2100000000],
  ];
  const creatorByName = new Map(creators.map((creator) => [creator.name, creator]));
  const networkByName = new Map(networks.map((network) => [network.name, network]));
  const channels = channelSnapshots.map(([atlasId, title, partnerName, subscribers, totalViews]) => {
    const creator = creatorByName.get(title);
    const network = networkByName.get(partnerName);
    return {
      id: creator?.channelId || `channel-${atlasId}`,
      atlasId,
      creatorId: creator?.id || null,
      organizationId: 'org-orbit',
      networkId: network.id,
      title,
      handle: null,
      subscriberCount: subscribers,
      totalViews,
      videoCount: null,
      metricsSource: 'Atlas Nexus P2P Labs public organization channel list; K/M counts rounded',
    };
  });
  const videos = creators.flatMap((creator, creatorIndex) => [0, 1].map((videoIndex) => {
    const id = `video-${creator.id.replace('creator-', '')}-${videoIndex + 1}`;
    const views = Math.round(creator.avgViews * (0.74 + ((creatorIndex + videoIndex) % 5) * 0.18));
    const month = videoIndex === 0 ? '10' : '09';
    const day = String(4 + creatorIndex * 2).padStart(2, '0');
    return {
      id,
      channelId: creator.channelId,
      title: `Sample video evidence ${videoIndex + 1} · ${creator.name}`,
      description: 'Demonstration fixture; this is not a live YouTube video record.',
      publishedAt: `2026-${month}-${day}`,
      views,
      likes: Math.round(views * (0.025 + creatorIndex * 0.001)),
      comments: Math.round(views * (0.004 + creatorIndex * 0.0002)),
      thumbnailColor: ['#dacff5', '#d9e7df', '#efd9c6', '#d8e2f3'][creatorIndex % 4],
      fixture: true,
    };
  }));
  const campaigns = [
    { id: 'campaign-lumina', ownerId: 'agency-demo', organizationId: 'org-orbit', name: 'Aruna · Everyday ritual', brandName: 'Aruna Botanicals', product: 'Daily cleansing balm', objective: 'Introduce a simple, low-waste skincare ritual through creators who make ingredient-led routines feel useful and approachable.', audience: 'People building a thoughtful everyday skincare routine.', languages: ['Indonesian'], formats: ['Long-form', 'Shorts'], createdAt: seedDate, fitResults: [] },
    { id: 'campaign-northstar', ownerId: 'agency-demo', organizationId: 'org-orbit', name: 'Nusa · Small-space living', brandName: 'Nusa Home', product: 'Modular desk system', objective: 'Show how one flexible desk setup can make a small apartment work harder.', audience: 'Renters and first-home owners in urban Indonesia.', languages: ['Indonesian'], formats: ['Long-form'], createdAt: seedDate, fitResults: [] },
  ];
  const reports = [
    { id: 'report-brand-deal', type: 'brand-deal', name: 'Kopi Sehari · Creator recap', ownerId: 'agency-demo', organizationId: 'org-orbit', videoIds: [videos[0].id, videos[2].id, videos[6].id, videos[10].id], brandName: 'Kopi Sehari', createdAt: seedDate, insight: null },
    { id: 'report-channel-maya', type: 'channel', name: 'Fetty Bismo Channel · Sample report', ownerId: 'creator-demo', channelId: 'channel-maya', period: '2026-09', videoIds: [videos[1].id], createdAt: seedDate, insight: null },
  ];
  const profilingSets = [{ id: 'profile-everyday-creators', name: 'P2P Labs channel sample', description: 'Selected public channel profiles from P2P Labs; topic fit requires review of current public videos.', ownerId: 'agency-demo', organizationId: 'org-orbit', channelIds: ['channel-maya', 'channel-bima', 'channel-loka'], createdAt: seedDate }];

  return { version: 2, seedDate, organizations, networks, channels, creators, videos, campaigns, shortlists: [], reports, profilingSets, insightAttempts: [] };
}
