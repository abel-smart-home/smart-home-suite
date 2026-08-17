FROM ghcr.io/home-assistant/base:3.24

ARG BUILD_VERSION
ARG BUILD_ARCH

LABEL \
  io.hass.version="${BUILD_VERSION}" \
  io.hass.type="app" \
  io.hass.arch="${BUILD_ARCH}" \
  org.opencontainers.image.title="Smart Home Suite Manager" \
  org.opencontainers.image.description="Installer and recovery manager for Abel Smart Home Suite" \
  org.opencontainers.image.source="https://github.com/abel-smart-home/smart-home-suite" \
  org.opencontainers.image.licenses="MIT"

COPY run.sh /run.sh
COPY payload /opt/smart-home-suite

RUN find /opt/smart-home-suite -type d -name '__pycache__' -prune -exec rm -rf {} + \
  && chmod a+x /run.sh

CMD [ "/run.sh" ]
