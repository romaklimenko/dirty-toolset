helm upgrade dirty-toolset ./helm --install \
  --history-max 3 \
  --set dirty.uid=$BOTAN_UID \
  --set dirty.sid=$BOTAN_SID
